################################################################################
# Automatically-generated file. Do not edit!
# Toolchain: GNU Tools for STM32 (13.3.rel1)
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
../X-CUBE-NFC9/App/app_x-cube-nfcx.c 

OBJS += \
./X-CUBE-NFC9/App/app_x-cube-nfcx.o 

C_DEPS += \
./X-CUBE-NFC9/App/app_x-cube-nfcx.d 


# Each subdirectory must supply rules for building sources it contributes
X-CUBE-NFC9/App/%.o X-CUBE-NFC9/App/%.su X-CUBE-NFC9/App/%.cyclo: ../X-CUBE-NFC9/App/%.c X-CUBE-NFC9/App/subdir.mk
	arm-none-eabi-gcc "$<" -mcpu=cortex-m0plus -std=gnu11 -g3 -DDEBUG -DST25R200 -DUSE_HAL_DRIVER -DSTM32G0B1xx -c -I../X-CUBE-NFC9/App -I../X-CUBE-NFC9/Target -I../Core/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc/Legacy -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Device/ST/STM32G0xx/Include -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Include -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/NFC09A1 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Middlewares/ST/rfal/Inc -O0 -ffunction-sections -fdata-sections -Wall -fstack-usage -fcyclomatic-complexity -MMD -MP -MF"$(@:%.o=%.d)" -MT"$@" --specs=nano.specs -mfloat-abi=soft -mthumb -o "$@"

clean: clean-X-2d-CUBE-2d-NFC9-2f-App

clean-X-2d-CUBE-2d-NFC9-2f-App:
	-$(RM) ./X-CUBE-NFC9/App/app_x-cube-nfcx.cyclo ./X-CUBE-NFC9/App/app_x-cube-nfcx.d ./X-CUBE-NFC9/App/app_x-cube-nfcx.o ./X-CUBE-NFC9/App/app_x-cube-nfcx.su

.PHONY: clean-X-2d-CUBE-2d-NFC9-2f-App

