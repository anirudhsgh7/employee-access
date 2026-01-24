
/**
  ******************************************************************************
  * File Name          :  app_x-cube-nfcx.c
  * Description        : This file provides code for the configuration
  *                      of the STMicroelectronics.X-CUBE-NFC9.1.0.0 instances.
  ******************************************************************************
  * @attention
  *
  * Copyright (c) 2025 STMicroelectronics.
  * All rights reserved.
  *
  * This software is licensed under terms that can be found in the LICENSE file
  * in the root directory of this software component.
  * If no LICENSE file comes with this software, it is provided AS-IS.
  *
  ******************************************************************************
  */

#ifdef __cplusplus
 extern "C" {
#endif

/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "rfal_platform.h"
#include "nfc_conf.h"
#include "app_x-cube-nfcx.h"

#include "rfal_platform.h"
#include "st25r200_irq.h"
/* Includes ------------------------------------------------------------------*/

/** @defgroup App NFC9
  * @{
  */

/** @defgroup Main
  * @{
  */

/* Private typedef -----------------------------------------------------------*/
/* Private define ------------------------------------------------------------*/
/* Private macro -------------------------------------------------------------*/
/* Private variables ---------------------------------------------------------*/
/* Global variables ----------------------------------------------------------*/

uint8_t globalCommProtectCnt = 0;   /*!< Global Protection counter     */

void MX_X_CUBE_NFC9_Init(void)
{
  /* USER CODE BEGIN SV */

  /* USER CODE END SV */

  /* USER CODE BEGIN NFC9_Library_Init_PreTreatment */

  /* USER CODE END NFC9_Library_Init_PreTreatment */

  /* Initialize the peripherals and the NFC9 components */
  MX_NFC9_PollingDemo_Init();
  /* USER CODE BEGIN SV */

  /* USER CODE END SV */

  /* USER CODE BEGIN NFC9_Library_Init_PostTreatment */

  /* USER CODE END NFC9_Library_Init_PostTreatment */

}
/*
 * LM background task
 */
void MX_X_CUBE_NFC9_Process(void)
{
    /* USER CODE BEGIN NFC9_Library_Process */

    /* USER CODE END NFC9_Library_Process */
    /* Run Demo Application */
    demoCycle();

}

void MX_NFC9_PollingDemo_Init(void)
{
     BSP_NFC0XCOMM_Init();
     BSP_COM_Init(COM1);

    USR_INT_LINE.Line = USR_INT_LINE_NUM;
    BSP_PB_Init(BUTTON_USER, BUTTON_MODE_GPIO);

    /* Configure interrupt callback */
   (void)HAL_EXTI_GetHandle(&USR_INT_LINE, USR_INT_LINE.Line);
   (void)HAL_EXTI_RegisterCallback(&USR_INT_LINE, HAL_EXTI_COMMON_CB_ID, BSP_NFC0XCOMM_IRQ_Callback);

    logUsartInit(&hcom_uart[0]);//logUsartInit(&huart2);
    platformLog("Welcome to X-NUCLEO-NFC09A1\r\n");

    demoIni();
}

/**
  * @brief      SPI Read and Write byte(s) to device
  * @param[in]  pTxData : Pointer to data buffer to write
  * @param[out] pRxData : Pointer to data buffer for read data
  * @param[in]  Length : number of bytes to write
  * @return     BSP status
  */
int32_t BSP_NFC0XCOMM_SendRecv(const uint8_t * const pTxData, uint8_t * const pRxData, uint16_t Length)
{
  HAL_StatusTypeDef status = HAL_ERROR;
  int32_t ret = BSP_ERROR_NONE;

  if((pTxData != NULL) && (pRxData != NULL))
  {
    status = HAL_SPI_TransmitReceive(&COMM_HANDLE, (uint8_t *)pTxData, (uint8_t *)pRxData, Length, 2000);
  }
  else if ((pTxData != NULL) && (pRxData == NULL))
  {
    status = HAL_SPI_Transmit(&COMM_HANDLE, (uint8_t *)pTxData, Length, 2000);
  }
  else if ((pTxData == NULL) && (pRxData != NULL))
  {
    status = HAL_SPI_Receive(&COMM_HANDLE, (uint8_t *)pRxData, Length, 2000);
  }
  else
  {
  	ret = BSP_ERROR_WRONG_PARAM;
  }

  /* Check the communication status */
  if (status != HAL_OK)
  {
    /* Execute user timeout callback */
    ret = BSP_NFC0XCOMM_Init();
  }

  return ret;
}

/**
  * @brief  BSP SPI1 callback
  * @param  None
  * @return None
  */
__weak void BSP_NFC0XCOMM_IRQ_Callback(void)
{
  /* Prevent unused argument(s) compilation warning */

  /* This function should be implemented by the user application.
   * It is called into this driver when an event from ST25R200 is triggered.
   */
  st25r200Isr();
}

#ifdef __cplusplus
}
#endif

