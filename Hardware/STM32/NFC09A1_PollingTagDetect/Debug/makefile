################################################################################
# Automatically-generated file. Do not edit!
# Toolchain: GNU Tools for STM32 (13.3.rel1)
################################################################################

-include ../makefile.init

RM := rm -rf

# All of the sources participating in the build are defined here
-include sources.mk
-include X-CUBE-NFC9/Target/subdir.mk
-include X-CUBE-NFC9/App/subdir.mk
-include Middlewares/X-CUBE-NFC9/Wireless/RFAL/Default_Config/subdir.mk
-include Drivers/STM32G0xx_HAL_Driver/subdir.mk
-include Drivers/BSP/NFC/subdir.mk
-include Drivers/BSP/Components/subdir.mk
-include Core/Startup/subdir.mk
-include Core/Src/subdir.mk
-include objects.mk

ifneq ($(MAKECMDGOALS),clean)
ifneq ($(strip $(S_DEPS)),)
-include $(S_DEPS)
endif
ifneq ($(strip $(S_UPPER_DEPS)),)
-include $(S_UPPER_DEPS)
endif
ifneq ($(strip $(C_DEPS)),)
-include $(C_DEPS)
endif
endif

-include ../makefile.defs

OPTIONAL_TOOL_DEPS := \
$(wildcard ../makefile.defs) \
$(wildcard ../makefile.init) \
$(wildcard ../makefile.targets) \


BUILD_ARTIFACT_NAME := NFC09A1_PollingTagDetect
BUILD_ARTIFACT_EXTENSION := elf
BUILD_ARTIFACT_PREFIX :=
BUILD_ARTIFACT := $(BUILD_ARTIFACT_PREFIX)$(BUILD_ARTIFACT_NAME)$(if $(BUILD_ARTIFACT_EXTENSION),.$(BUILD_ARTIFACT_EXTENSION),)

# Add inputs and outputs from these tool invocations to the build variables 
EXECUTABLES += \
NFC09A1_PollingTagDetect.elf \

MAP_FILES += \
NFC09A1_PollingTagDetect.map \

SIZE_OUTPUT += \
default.size.stdout \

OBJDUMP_LIST += \
NFC09A1_PollingTagDetect.list \


# All Target
all: main-build

# Main-build Target
main-build: NFC09A1_PollingTagDetect.elf secondary-outputs

# Tool invocations
NFC09A1_PollingTagDetect.elf NFC09A1_PollingTagDetect.map: $(OBJS) $(USER_OBJS) /Users/anirudhsingh/Documents/NFC09A1_PollingTagDetect/STM32G0B1RETX_FLASH.ld makefile objects.list $(OPTIONAL_TOOL_DEPS)
	arm-none-eabi-gcc -o "NFC09A1_PollingTagDetect.elf" @"objects.list" $(USER_OBJS) $(LIBS) -mcpu=cortex-m0plus -T"/Users/anirudhsingh/Documents/NFC09A1_PollingTagDetect/STM32G0B1RETX_FLASH.ld" --specs=nosys.specs -Wl,-Map="NFC09A1_PollingTagDetect.map" -Wl,--gc-sections -static --specs=nano.specs -mfloat-abi=soft -mthumb -Wl,--start-group -lc -lm -Wl,--end-group
	@echo 'Finished building target: $@'
	@echo ' '

default.size.stdout: $(EXECUTABLES) makefile objects.list $(OPTIONAL_TOOL_DEPS)
	arm-none-eabi-size  $(EXECUTABLES)
	@echo 'Finished building: $@'
	@echo ' '

NFC09A1_PollingTagDetect.list: $(EXECUTABLES) makefile objects.list $(OPTIONAL_TOOL_DEPS)
	arm-none-eabi-objdump -h -S $(EXECUTABLES) > "NFC09A1_PollingTagDetect.list"
	@echo 'Finished building: $@'
	@echo ' '

# Other Targets
clean:
	-$(RM) NFC09A1_PollingTagDetect.elf NFC09A1_PollingTagDetect.list NFC09A1_PollingTagDetect.map default.size.stdout
	-@echo ' '

secondary-outputs: $(SIZE_OUTPUT) $(OBJDUMP_LIST)

fail-specified-linker-script-missing:
	@echo 'Error: Cannot find the specified linker script. Check the linker settings in the build configuration.'
	@exit 2

warn-no-linker-script-specified:
	@echo 'Warning: No linker script specified. Check the linker settings in the build configuration.'

.PHONY: all clean dependents main-build fail-specified-linker-script-missing warn-no-linker-script-specified

-include ../makefile.targets
