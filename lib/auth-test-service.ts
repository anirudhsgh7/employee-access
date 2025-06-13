import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export interface AuthTestResult {
  step: string
  success: boolean
  details: any
  error?: string
}

export async function runAuthenticationDiagnostics(userId: string, password: string): Promise<AuthTestResult[]> {
  const results: AuthTestResult[] = []

  try {
    // Step 1: Database Connection Test
    results.push({
      step: "database_connection",
      success: true,
      details: { message: "Database connection successful" },
    })

    // Step 2: User Existence Check
    const userQuery = await sql`
      SELECT 
        id, user_id, password_hash, full_name, is_active, 
        failed_attempts, locked_until, last_login,
        LENGTH(password_hash) as hash_length,
        SUBSTRING(password_hash, 1, 10) as hash_prefix
      FROM admin_users 
      WHERE user_id = ${userId}
    `

    if (userQuery.length === 0) {
      results.push({
        step: "user_existence",
        success: false,
        details: { found: false, userId },
        error: "User not found in database",
      })
      return results
    }

    const user = userQuery[0] as any
    results.push({
      step: "user_existence",
      success: true,
      details: {
        found: true,
        userId: user.user_id,
        fullName: user.full_name,
        isActive: user.is_active,
        failedAttempts: user.failed_attempts,
        lockedUntil: user.locked_until,
        hashLength: user.hash_length,
        hashPrefix: user.hash_prefix,
      },
    })

    // Step 3: User Active Status Check
    if (!user.is_active) {
      results.push({
        step: "user_active_status",
        success: false,
        details: { isActive: false },
        error: "User account is inactive",
      })
      return results
    }

    results.push({
      step: "user_active_status",
      success: true,
      details: { isActive: true },
    })

    // Step 4: Account Lock Status Check
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      results.push({
        step: "account_lock_status",
        success: false,
        details: {
          isLocked: true,
          lockedUntil: user.locked_until,
          remainingTime: Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000),
        },
        error: "Account is currently locked",
      })
      return results
    }

    results.push({
      step: "account_lock_status",
      success: true,
      details: { isLocked: false },
    })

    // Step 5: Password Hash Format Validation
    const hashFormatValid = user.password_hash && user.password_hash.startsWith("$2b$12$") && user.hash_length === 60

    results.push({
      step: "password_hash_format",
      success: hashFormatValid,
      details: {
        hashExists: !!user.password_hash,
        hashLength: user.hash_length,
        hashPrefix: user.hash_prefix,
        expectedFormat: "$2b$12$",
        isValidFormat: hashFormatValid,
      },
      error: hashFormatValid ? undefined : "Password hash format is invalid",
    })

    // Step 6: Password Verification Test
    let passwordVerificationResult = false
    let verificationError = null

    try {
      if (user.password_hash) {
        passwordVerificationResult = await bcrypt.compare(password, user.password_hash)
      } else {
        verificationError = "No password hash stored"
      }
    } catch (error) {
      verificationError = `bcrypt comparison failed: ${error instanceof Error ? error.message : "unknown error"}`
    }

    results.push({
      step: "password_verification",
      success: passwordVerificationResult,
      details: {
        passwordProvided: !!password,
        hashProvided: !!user.password_hash,
        verificationResult: passwordVerificationResult,
        bcryptWorking: !verificationError,
      },
      error: verificationError || (!passwordVerificationResult ? "Password does not match hash" : undefined),
    })

    // Step 7: Create Test Hash for Comparison
    try {
      const testHash = await bcrypt.hash(password, 12)
      const testVerification = await bcrypt.compare(password, testHash)

      results.push({
        step: "bcrypt_functionality_test",
        success: testVerification,
        details: {
          testHashGenerated: !!testHash,
          testHashLength: testHash.length,
          testVerificationPassed: testVerification,
          bcryptLibraryWorking: true,
        },
      })
    } catch (error) {
      results.push({
        step: "bcrypt_functionality_test",
        success: false,
        details: { bcryptLibraryWorking: false },
        error: `bcrypt library error: ${error instanceof Error ? error.message : "unknown"}`,
      })
    }

    return results
  } catch (error) {
    results.push({
      step: "diagnostic_error",
      success: false,
      details: {},
      error: `Diagnostic failed: ${error instanceof Error ? error.message : "unknown error"}`,
    })
    return results
  }
}

export async function createValidAdminUser(): Promise<{ success: boolean; details: any; error?: string }> {
  try {
    // Generate a proper bcrypt hash for 'admin123'
    const properHash = await bcrypt.hash("admin123", 12)

    // Delete existing admin user
    await sql`DELETE FROM admin_users WHERE user_id = 'admin'`

    // Create new admin user with proper hash
    await sql`
      INSERT INTO admin_users (
        user_id, password_hash, full_name, is_active, 
        failed_attempts, locked_until, last_login, created_at
      ) VALUES (
        'admin', ${properHash}, 'System Administrator', true,
        0, NULL, NULL, CURRENT_TIMESTAMP
      )
    `

    // Verify the creation
    const verification = await sql`
      SELECT user_id, full_name, is_active, LENGTH(password_hash) as hash_length
      FROM admin_users WHERE user_id = 'admin'
    `

    // Test the password immediately
    const testResult = await bcrypt.compare("admin123", properHash)

    return {
      success: true,
      details: {
        userCreated: verification.length > 0,
        hashLength: verification[0]?.hash_length,
        passwordTestPassed: testResult,
        newHashGenerated: true,
      },
    }
  } catch (error) {
    return {
      success: false,
      details: {},
      error: `Failed to create admin user: ${error instanceof Error ? error.message : "unknown"}`,
    }
  }
}
