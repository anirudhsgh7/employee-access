################################################################################
# Automatically-generated file. Do not edit!
# Toolchain: GNU Tools for STM32 (13.3.rel1)
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
/Users/anirudhsingh/STM32Cube/Repository/Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200/rfal_rfst25r200.c \
/Users/anirudhsingh/STM32Cube/Repository/Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200/st25r200.c \
/Users/anirudhsingh/STM32Cube/Repository/Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200/st25r200_com.c \
/Users/anirudhsingh/STM32Cube/Repository/Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200/st25r200_irq.c \
/Users/anirudhsingh/STM32Cube/Repository/Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200/timer.c 

OBJS += \
./Drivers/BSP/Components/rfal_rfst25r200.o \
./Drivers/BSP/Components/st25r200.o \
./Drivers/BSP/Components/st25r200_com.o \
./Drivers/BSP/Components/st25r200_irq.o \
./Drivers/BSP/Components/timer.o 

C_DEPS += \
./Drivers/BSP/Components/rfal_rfst25r200.d \
./Drivers/BSP/Components/st25r200.d \
./Drivers/BSP/Components/st25r200_com.d \
./Drivers/BSP/Components/st25r200_irq.d \
./Drivers/BSP/Components/timer.d 


# Each subdirectory must supply rules for building sources it contributes
Drivers/BSP/Components/rfal_rfst25r200.o: /Users/anirudhsingh/STM32Cube/Repository/Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200/rfal_rfst25r200.c Drivers/BSP/Components/subdir.mk
	arm-none-eabi-gcc "$<" -mcpu=cortex-m0plus -std=gnu11 -g3 -DDEBUG -DST25R200 -DUSE_HAL_DRIVER -DSTM32G0B1xx -c -I../X-CUBE-NFC9/App -I../X-CUBE-NFC9/Target -I../Core/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc/Legacy -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Device/ST/STM32G0xx/Include -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Include -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/NFC09A1 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Middlewares/ST/rfal/Inc -O0 -ffunction-sections -fdata-sections -Wall -fstack-usage -fcyclomatic-complexity -MMD -MP -MF"$(@:%.o=%.d)" -MT"$@" --specs=nano.specs -mfloat-abi=soft -mthumb -o "$@"
Drivers/BSP/Components/st25r200.o: /Users/anirudhsingh/STM32Cube/Repository/Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200/st25r200.c Drivers/BSP/Components/subdir.mk
	arm-none-eabi-gcc "$<" -mcpu=cortex-m0plus -std=gnu11 -g3 -DDEBUG -DST25R200 -DUSE_HAL_DRIVER -DSTM32G0B1xx -c -I../X-CUBE-NFC9/App -I../X-CUBE-NFC9/Target -I../Core/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc/Legacy -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Device/ST/STM32G0xx/Include -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Include -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/NFC09A1 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Middlewares/ST/rfal/Inc -O0 -ffunction-sections -fdata-sections -Wall -fstack-usage -fcyclomatic-complexity -MMD -MP -MF"$(@:%.o=%.d)" -MT"$@" --specs=nano.specs -mfloat-abi=soft -mthumb -o "$@"
Drivers/BSP/Components/st25r200_com.o: /Users/anirudhsingh/STM32Cube/Repository/Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200/st25r200_com.c Drivers/BSP/Components/subdir.mk
	arm-none-eabi-gcc "$<" -mcpu=cortex-m0plus -std=gnu11 -g3 -DDEBUG -DST25R200 -DUSE_HAL_DRIVER -DSTM32G0B1xx -c -I../X-CUBE-NFC9/App -I../X-CUBE-NFC9/Target -I../Core/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc/Legacy -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Device/ST/STM32G0xx/Include -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Include -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/NFC09A1 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Middlewares/ST/rfal/Inc -O0 -ffunction-sections -fdata-sections -Wall -fstack-usage -fcyclomatic-complexity -MMD -MP -MF"$(@:%.o=%.d)" -MT"$@" --specs=nano.specs -mfloat-abi=soft -mthumb -o "$@"
Drivers/BSP/Components/st25r200_irq.o: /Users/anirudhsingh/STM32Cube/Repository/Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200/st25r200_irq.c Drivers/BSP/Components/subdir.mk
	arm-none-eabi-gcc "$<" -mcpu=cortex-m0plus -std=gnu11 -g3 -DDEBUG -DST25R200 -DUSE_HAL_DRIVER -DSTM32G0B1xx -c -I../X-CUBE-NFC9/App -I../X-CUBE-NFC9/Target -I../Core/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc/Legacy -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Device/ST/STM32G0xx/Include -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Include -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/NFC09A1 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Middlewares/ST/rfal/Inc -O0 -ffunction-sections -fdata-sections -Wall -fstack-usage -fcyclomatic-complexity -MMD -MP -MF"$(@:%.o=%.d)" -MT"$@" --specs=nano.specs -mfloat-abi=soft -mthumb -o "$@"
Drivers/BSP/Components/timer.o: /Users/anirudhsingh/STM32Cube/Repository/Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200/timer.c Drivers/BSP/Components/subdir.mk
	arm-none-eabi-gcc "$<" -mcpu=cortex-m0plus -std=gnu11 -g3 -DDEBUG -DST25R200 -DUSE_HAL_DRIVER -DSTM32G0B1xx -c -I../X-CUBE-NFC9/App -I../X-CUBE-NFC9/Target -I../Core/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc/Legacy -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Device/ST/STM32G0xx/Include -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Include -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/NFC09A1 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Middlewares/ST/rfal/Inc -O0 -ffunction-sections -fdata-sections -Wall -fstack-usage -fcyclomatic-complexity -MMD -MP -MF"$(@:%.o=%.d)" -MT"$@" --specs=nano.specs -mfloat-abi=soft -mthumb -o "$@"

clean: clean-Drivers-2f-BSP-2f-Components

clean-Drivers-2f-BSP-2f-Components:
	-$(RM) ./Drivers/BSP/Components/rfal_rfst25r200.cyclo ./Drivers/BSP/Components/rfal_rfst25r200.d ./Drivers/BSP/Components/rfal_rfst25r200.o ./Drivers/BSP/Components/rfal_rfst25r200.su ./Drivers/BSP/Components/st25r200.cyclo ./Drivers/BSP/Components/st25r200.d ./Drivers/BSP/Components/st25r200.o ./Drivers/BSP/Components/st25r200.su ./Drivers/BSP/Components/st25r200_com.cyclo ./Drivers/BSP/Components/st25r200_com.d ./Drivers/BSP/Components/st25r200_com.o ./Drivers/BSP/Components/st25r200_com.su ./Drivers/BSP/Components/st25r200_irq.cyclo ./Drivers/BSP/Components/st25r200_irq.d ./Drivers/BSP/Components/st25r200_irq.o ./Drivers/BSP/Components/st25r200_irq.su ./Drivers/BSP/Components/timer.cyclo ./Drivers/BSP/Components/timer.d ./Drivers/BSP/Components/timer.o ./Drivers/BSP/Components/timer.su

.PHONY: clean-Drivers-2f-BSP-2f-Components

