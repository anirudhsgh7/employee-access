################################################################################
# Automatically-generated file. Do not edit!
# Toolchain: GNU Tools for STM32 (13.3.rel1)
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
/Users/anirudhsingh/STM32Cube/Repository/Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/NFC09A1/nfc09a1.c 

OBJS += \
./Drivers/BSP/NFC/nfc09a1.o 

C_DEPS += \
./Drivers/BSP/NFC/nfc09a1.d 


# Each subdirectory must supply rules for building sources it contributes
Drivers/BSP/NFC/nfc09a1.o: /Users/anirudhsingh/STM32Cube/Repository/Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/NFC09A1/nfc09a1.c Drivers/BSP/NFC/subdir.mk
	arm-none-eabi-gcc "$<" -mcpu=cortex-m0plus -std=gnu11 -g3 -DDEBUG -DST25R200 -DUSE_HAL_DRIVER -DSTM32G0B1xx -c -I../X-CUBE-NFC9/App -I../X-CUBE-NFC9/Target -I../Core/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc/Legacy -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Device/ST/STM32G0xx/Include -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Include -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/NFC09A1 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Middlewares/ST/rfal/Inc -O0 -ffunction-sections -fdata-sections -Wall -fstack-usage -fcyclomatic-complexity -MMD -MP -MF"$(@:%.o=%.d)" -MT"$@" --specs=nano.specs -mfloat-abi=soft -mthumb -o "$@"

clean: clean-Drivers-2f-BSP-2f-NFC

clean-Drivers-2f-BSP-2f-NFC:
	-$(RM) ./Drivers/BSP/NFC/nfc09a1.cyclo ./Drivers/BSP/NFC/nfc09a1.d ./Drivers/BSP/NFC/nfc09a1.o ./Drivers/BSP/NFC/nfc09a1.su

.PHONY: clean-Drivers-2f-BSP-2f-NFC

