################################################################################
# Automatically-generated file. Do not edit!
# Toolchain: GNU Tools for STM32 (13.3.rel1)
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
../Core/Src/main.c \
../Core/Src/stm32g0xx_hal_msp.c \
../Core/Src/stm32g0xx_it.c \
../Core/Src/stm32g0xx_nucleo.c \
../Core/Src/stm32g0xx_nucleo_bus.c \
../Core/Src/syscalls.c \
../Core/Src/sysmem.c \
../Core/Src/system_stm32g0xx.c 

OBJS += \
./Core/Src/main.o \
./Core/Src/stm32g0xx_hal_msp.o \
./Core/Src/stm32g0xx_it.o \
./Core/Src/stm32g0xx_nucleo.o \
./Core/Src/stm32g0xx_nucleo_bus.o \
./Core/Src/syscalls.o \
./Core/Src/sysmem.o \
./Core/Src/system_stm32g0xx.o 

C_DEPS += \
./Core/Src/main.d \
./Core/Src/stm32g0xx_hal_msp.d \
./Core/Src/stm32g0xx_it.d \
./Core/Src/stm32g0xx_nucleo.d \
./Core/Src/stm32g0xx_nucleo_bus.d \
./Core/Src/syscalls.d \
./Core/Src/sysmem.d \
./Core/Src/system_stm32g0xx.d 


# Each subdirectory must supply rules for building sources it contributes
Core/Src/%.o Core/Src/%.su Core/Src/%.cyclo: ../Core/Src/%.c Core/Src/subdir.mk
	arm-none-eabi-gcc "$<" -mcpu=cortex-m0plus -std=gnu11 -g3 -DDEBUG -DST25R200 -DUSE_HAL_DRIVER -DSTM32G0B1xx -c -I../X-CUBE-NFC9/App -I../X-CUBE-NFC9/Target -I../Core/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/STM32G0xx_HAL_Driver/Inc/Legacy -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Device/ST/STM32G0xx/Include -I/Users/anirudhsingh/STM32Cube/Repository/STM32Cube_FW_G0_V1.6.2/Drivers/CMSIS/Include -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/NFC09A1 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Drivers/BSP/Components/st25r200 -I/Users/anirudhsingh/STM32Cube/Repository//Packs/STMicroelectronics/X-CUBE-NFC9/1.0.0/Middlewares/ST/rfal/Inc -O0 -ffunction-sections -fdata-sections -Wall -fstack-usage -fcyclomatic-complexity -MMD -MP -MF"$(@:%.o=%.d)" -MT"$@" --specs=nano.specs -mfloat-abi=soft -mthumb -o "$@"

clean: clean-Core-2f-Src

clean-Core-2f-Src:
	-$(RM) ./Core/Src/main.cyclo ./Core/Src/main.d ./Core/Src/main.o ./Core/Src/main.su ./Core/Src/stm32g0xx_hal_msp.cyclo ./Core/Src/stm32g0xx_hal_msp.d ./Core/Src/stm32g0xx_hal_msp.o ./Core/Src/stm32g0xx_hal_msp.su ./Core/Src/stm32g0xx_it.cyclo ./Core/Src/stm32g0xx_it.d ./Core/Src/stm32g0xx_it.o ./Core/Src/stm32g0xx_it.su ./Core/Src/stm32g0xx_nucleo.cyclo ./Core/Src/stm32g0xx_nucleo.d ./Core/Src/stm32g0xx_nucleo.o ./Core/Src/stm32g0xx_nucleo.su ./Core/Src/stm32g0xx_nucleo_bus.cyclo ./Core/Src/stm32g0xx_nucleo_bus.d ./Core/Src/stm32g0xx_nucleo_bus.o ./Core/Src/stm32g0xx_nucleo_bus.su ./Core/Src/syscalls.cyclo ./Core/Src/syscalls.d ./Core/Src/syscalls.o ./Core/Src/syscalls.su ./Core/Src/sysmem.cyclo ./Core/Src/sysmem.d ./Core/Src/sysmem.o ./Core/Src/sysmem.su ./Core/Src/system_stm32g0xx.cyclo ./Core/Src/system_stm32g0xx.d ./Core/Src/system_stm32g0xx.o ./Core/Src/system_stm32g0xx.su

.PHONY: clean-Core-2f-Src

