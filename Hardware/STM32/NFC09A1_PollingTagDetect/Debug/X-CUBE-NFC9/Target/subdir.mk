################################################################################
# Automatically-generated file. Do not edit!
# Toolchain: GNU Tools for STM32 (13.3.rel1)
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
../X-CUBE-NFC9/Target/demo_polling.c \
../X-CUBE-NFC9/Target/logger.c \
../X-CUBE-NFC9/Target/nfc_conf.c 

OBJS += \
./X-CUBE-NFC9/Target/demo_polling.o \
./X-CUBE-NFC9/Target/logger.o \
./X-CUBE-NFC9/Target/nfc_conf.o 

C_DEPS += \
./X-CUBE-NFC9/Target/demo_polling.d \
./X-CUBE-NFC9/Target/logger.d \
./X-CUBE-NFC9/Target/nfc_conf.d 


# Each subdirectory must supply rules for building sources it contributes
X-CUBE-NFC9/Target/%.o X-CUBE-NFC9/Target/%.su X-CUBE-NFC9/Target/%.cyclo: ../X-CUBE-NFC9/Target/%.c X-CUBE-NFC9/Target/subdir.mk
	arm-none-eabi-gcc "$<" -mcpu=cortex-m0plus -std=gnu11 -g3 -DDEBUG -DST25R200 -DUSE_HAL_DRIVER -DSTM32G0B1xx -c -I../X-CUBE-NFC9/App -I../X-CUBE-NFC9/Target -I../Core/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc/Legacy -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Device/ST/STM32G0xx/Include -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Include -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/NFC09A1 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Middlewares/ST/rfal/Inc -O0 -ffunction-sections -fdata-sections -Wall -fstack-usage -fcyclomatic-complexity -MMD -MP -MF"$(@:%.o=%.d)" -MT"$@" --specs=nano.specs -mfloat-abi=soft -mthumb -o "$@"

clean: clean-X-2d-CUBE-2d-NFC9-2f-Target

clean-X-2d-CUBE-2d-NFC9-2f-Target:
	-$(RM) ./X-CUBE-NFC9/Target/demo_polling.cyclo ./X-CUBE-NFC9/Target/demo_polling.d ./X-CUBE-NFC9/Target/demo_polling.o ./X-CUBE-NFC9/Target/demo_polling.su ./X-CUBE-NFC9/Target/logger.cyclo ./X-CUBE-NFC9/Target/logger.d ./X-CUBE-NFC9/Target/logger.o ./X-CUBE-NFC9/Target/logger.su ./X-CUBE-NFC9/Target/nfc_conf.cyclo ./X-CUBE-NFC9/Target/nfc_conf.d ./X-CUBE-NFC9/Target/nfc_conf.o ./X-CUBE-NFC9/Target/nfc_conf.su

.PHONY: clean-X-2d-CUBE-2d-NFC9-2f-Target

