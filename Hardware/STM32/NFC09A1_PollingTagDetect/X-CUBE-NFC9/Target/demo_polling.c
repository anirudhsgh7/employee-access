/**
  ******************************************************************************
  * @file           : demo_polling.c
  * @brief          : Demo polling file (Minimal: Only UID)
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

#include "demo.h"
#include "utils.h"
#include "logger.h"
#include "rfal_nfc.h"

#if RFAL_SUPPORT_CE && RFAL_FEATURE_LISTEN_MODE
#include "demo_ce.h"
#endif /* RFAL_FEATURE_LISTEN_MODE */

#define DEMO_ST_NOTINIT               0
#define DEMO_ST_START_DISCOVERY       1
#define DEMO_ST_DISCOVERY             2

#define DEMO_NFCV_BLOCK_LEN           4
#define DEMO_NFCV_USE_SELECT_MODE     false
#define DEMO_NFCV_WRITE_TAG           false

#if defined(DEMO_LISTEN_MODE_TARGET)
  /* ... (listen mode defines unchanged) ... */
#else
  /* ... (other listen mode defines unchanged) ... */
#endif

static uint8_t NFCID3[] = {0x01,0xFE,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0A};
static uint8_t GB[]     = {0x46,0x66,0x6d,0x01,0x01,0x11,0x02,0x02,0x07,0x80,
                          0x03,0x02,0x00,0x03,0x04,0x01,0x32,0x07,0x01,0x03};

#if RFAL_FEATURE_ISO_DEP_POLL
static uint8_t ndefSelectApp[] = {0x00,0xA4,0x04,0x00,0x07,0xD2,0x76,0x00,0x00,0x85,0x01,0x01,0x00};
static uint8_t ccSelectFile[]  = {0x00,0xA4,0x00,0x0C,0x02,0xE1,0x03};
static uint8_t readBinary[]    = {0x00,0xB0,0x00,0x00,0x0F};
#endif

#if RFAL_FEATURE_NFC_DEP
static uint8_t ndefLLCPSYMM[]  = {0x00,0x00};
static uint8_t ndefInit[]      = {0x05,0x20,0x06,0x0F,0x75,0x72,0x6E,0x3A,0x6E,0x66,0x63,0x3A,0x73,0x6E,0x3A,0x73,0x6E,0x65,0x70,0x02,0x02,0x07,0x80,0x05,0x01,0x02};
static uint8_t ndefUriSTcom[]  = {0x13,0x20,0x00,0x10,0x02,0x00,0x00,0x00,0x19,0xc1,0x01,0x00,0x00,0x00,0x12,0x55,0x00,0x68,0x74,0x74,0x70,0x3a,0x2f,0x2f,0x77,0x77,0x77,0x2e,0x73,0x74,0x2e,0x63,0x6f,0x6d};
#endif

#if RFAL_SUPPORT_CE && RFAL_FEATURE_LISTEN_MODE
  /* ... (card emulation config unchanged) ... */
#endif

static rfalNfcDiscoverParam discParam;
static uint8_t              state = DEMO_ST_NOTINIT;
static bool                 multiSel;

static void demoP2P( rfalNfcDevice *nfcDev );
static void demoAPDU( void );
static void demoNfcv( rfalNfcvListenDevice *nfcvDev );
static void demoNfcf( rfalNfcfListenDevice *nfcfDev );
static void demoT2t( void );
static void demoCE( rfalNfcDevice *nfcDev );

/*!
 *****************************************************************************
 * \brief Demo Notification
 *****************************************************************************
 */
static void demoNotif( rfalNfcState st )
{
    /* All platformLog() calls removed */
}

/*!
 *****************************************************************************
 * \brief Demo Ini
 *****************************************************************************
 */
bool demoIni( void )
{
    ReturnCode err;

    err = rfalNfcInitialize();
    if( err != RFAL_ERR_NONE )
    {
        return false;
    }

    rfalNfcDefaultDiscParams( &discParam );
    discParam.devLimit      = 1U;
    ST_MEMCPY( &discParam.nfcid3, NFCID3, sizeof(NFCID3) );
    ST_MEMCPY( &discParam.GB,     GB,     sizeof(GB) );
    discParam.GBLen         = sizeof(GB);
    discParam.notifyCb      = demoNotif;
    discParam.totalDuration = 1000U;
    discParam.techs2Find    = RFAL_NFC_TECH_NONE
#if RFAL_FEATURE_NFCA
                            | RFAL_NFC_POLL_TECH_A
#endif
#if RFAL_FEATURE_NFCB
                            | RFAL_NFC_POLL_TECH_B
#endif
#if RFAL_FEATURE_NFCF
                            | RFAL_NFC_POLL_TECH_F
#endif
#if RFAL_FEATURE_NFCV
                            | RFAL_NFC_POLL_TECH_V
#endif
                            ;

    err = rfalNfcDiscover( &discParam );
    if( err != RFAL_ERR_NONE )
    {
        return false;
    }

    state = DEMO_ST_START_DISCOVERY;
    return true;
}

/*!
 *****************************************************************************
 * \brief Demo Cycle
 *****************************************************************************
 */
void demoCycle( void )
{
    static rfalNfcDevice *nfcDevice;

    rfalNfcWorker();

    switch( state )
    {
        case DEMO_ST_START_DISCOVERY:
            multiSel = false;
            state    = DEMO_ST_DISCOVERY;
            break;

        case DEMO_ST_DISCOVERY:
            if( rfalNfcIsDevActivated( rfalNfcGetState() ) )
            {
                rfalNfcGetActiveDevice( &nfcDevice );

                /* Print only UID, regardless of type */
                {
                    char *uidStr = hex2Str( nfcDevice->nfcid, nfcDevice->nfcidLen );
                    platformLog( "%s\r\n", uidStr );
                }

                rfalNfcDeactivate( RFAL_NFC_DEACTIVATE_DISCOVERY );
                state = DEMO_ST_START_DISCOVERY;
            }
            break;

        default:
            break;
    }
}

/*!
 *****************************************************************************
 * \brief Demo Stop
 *****************************************************************************
 */
void demoStop( void )
{
    rfalNfcDeactivate( RFAL_NFC_DEACTIVATE_IDLE );
    state = DEMO_ST_NOTINIT;
}

/*!
 *****************************************************************************
 * \brief Blocking Transceive
 *****************************************************************************
 */
ReturnCode demoTransceiveBlocking( uint8_t *txBuf, uint16_t txBufSize,
                                   uint8_t **rxData, uint16_t **rcvLen, uint32_t fwt )
{
    ReturnCode err;

    err = rfalNfcDataExchangeStart( txBuf, txBufSize, rxData, rcvLen, fwt );
    if( err == RFAL_ERR_NONE )
    {
        do {
            rfalNfcWorker();
            err = rfalNfcDataExchangeGetStatus();
        } while( err == RFAL_ERR_BUSY );
    }
    return err;
}
