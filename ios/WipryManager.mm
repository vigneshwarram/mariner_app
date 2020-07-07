#import "WipryManager.h"
#import <React/RCTLog.h>
#import <WiPry2500x/WiPry2500x.h>
#import <ExternalAccessory/ExternalAccessory.h>
#include <iostream>
#include <string>
#include <sstream>

int const SSID_ELEMENT_ID = 0;
int const SUPPORTED_RATES_ELEMENT_ID = 1;
int const DSSS_PARAMETER_ELEMENT_ID = 3;
int const CF_PARAMETER_ELEMENT_ID = 4;
int const TIM_ELEMENT_ID = 5;
int const IBSS_PARAMETER_ELEMENT_ID = 6;
int const COUNTRY_ELEMENT_ID = 7;
int const BSS_LOAD_ELEMENT_ID = 11;
int const POWER_CONSTRAINT_ELEMENT_ID = 32;
int const TPC_REPORT_ELEMENT_ID = 35;
int const CHANNEL_SWITCH_ELEMENT_ID = 37;
int const QUIET_ELEMENT_ID = 40;
int const ERP_ELEMENT_ID = 42;
int const HT_CAPABILITIES_ELEMENT_ID = 45;
int const RSN_ELEMENT_ID = 48;
int const EXTENDED_RATES_ELEMENT_ID = 50;
int const MOBILITY_DOMAIN_ELEMENT_ID = 54;
int const HT_OPERATION_ELEMENT_ID = 61;
int const VHT_OPERATION_ELEMENT_ID = 192;

int MAC_HEADER_LENGTH = 48;

int SSID_ELEMENT_LENGTH = 0;
int SUPPORTED_RATES_ELEMENT_LENGTH = 0;
int DSSS_PARAMETER_ELEMENT_LENGTH = 0;
int CF_PARAMETER_ELEMENT_LENGTH = 0;
int TIM_ELEMENT_LENGTH = 0;
int IBSS_PARAMETER_ELEMENT_LENGTH = 0;
int COUNTRY_ELEMENT_LENGTH = 0;
int BSS_LOAD_ELEMENT_LENGTH = 0;
int POWER_CONSTRAINT_ELEMENT_LENGTH = 0;
int CHANNEL_SWITCH_ELEMENT_LENGTH = 0;
int QUIET_ELEMENT_LENGTH = 0;
int TPC_REPORT_ELEMENT_LENGTH = 0;
int ERP_ELEMENT_LENGTH = 0;
int HT_CAPABILITIES_ELEMENT_LENGTH = 0;
int RSN_ELEMENT_LENGTH = 0;
int EXTENDED_RATES_ELEMENT_LENGTH = 0;
int MOBILITY_DOMAIN_ELEMENT_LENGTH = 0;
int HT_OPERATION_ELEMENT_LENGTH = 0;
int VHT_OPERATION_ELEMENT_LENGTH = 0;

uint8_t * beaconObject;

class MyWiPry2500xDelegate : public oscium::WiPry2500xDelegate {
public:
  WipryManager * WipryManager;
  
  MyWiPry2500xDelegate() {
    WipryManager = nil;
  }
  
  void wipry2500xDidConnect(oscium::WiPry2500x *wipry2500x) {
    RCTLog(@"Connected to device.");
    //[WipryManager sendEventWithName:@"WipryConnected" body:nil];
  }
  
  void wipry2500xUnableToConnect(oscium::WiPry2500x *wipry2500x, oscium::WiPry2500x::ErrorCode errorCode) {
      NSLog(@"Disconnected from Accessory with Error Code: %d", (int )errorCode);
  }

  void wipry2500xDidReceiveBeaconCaptureData(oscium::WiPry2500x *wipry2500x, std::vector<uint8_t> beaconCaptures) {
      NSLog(@"-------");
      RCTLog(@"Received beacon information");
      NSMutableArray* scanResults = [[NSMutableArray alloc] init];

      OsciumBeaconCapture * beaconCapture = (OsciumBeaconCapture*)beaconCaptures.data();
      size_t beaconCaptureLen = beaconCaptures.size();
      if (beaconCaptureLen >= OSCIUMBEACONCAPTURE_HEADER_LEN
          && beaconCaptureLen == (OSCIUMBEACONCAPTURE_HEADER_LEN + beaconCapture->dataLength) ) {

          uint8_t * beaconCaptureDataBuffer = beaconCapture->data;
          uint32_t beaconCaptureDataBufferLen = beaconCapture->dataLength;

          uint32_t count = 0;
          while (beaconCaptureDataBufferLen > 0) {

              SSID_ELEMENT_LENGTH = 0;
              SUPPORTED_RATES_ELEMENT_LENGTH = 0;
              DSSS_PARAMETER_ELEMENT_LENGTH = 0;
              CF_PARAMETER_ELEMENT_LENGTH = 0;
              TIM_ELEMENT_LENGTH = 0;
              IBSS_PARAMETER_ELEMENT_LENGTH = 0;
              COUNTRY_ELEMENT_LENGTH = 0;
              BSS_LOAD_ELEMENT_LENGTH = 0;
              POWER_CONSTRAINT_ELEMENT_LENGTH = 0;
              CHANNEL_SWITCH_ELEMENT_LENGTH = 0;
              QUIET_ELEMENT_LENGTH = 0;
              TPC_REPORT_ELEMENT_LENGTH = 0;
              ERP_ELEMENT_LENGTH = 0;
              HT_CAPABILITIES_ELEMENT_LENGTH = 0;
              RSN_ELEMENT_LENGTH = 0;
              EXTENDED_RATES_ELEMENT_LENGTH = 0;
              MOBILITY_DOMAIN_ELEMENT_LENGTH = 0;
              HT_OPERATION_ELEMENT_LENGTH = 0;
              NSString *ssidString = @"";
              NSString *supportedRates = @"";
              int8_t dsParameter = 0;
              NSString *cfParameter = @"";
              NSString *tim = @"";
              NSString *country = @"";
              NSString *bssLoad = @"";
              uint8_t primaryChannel = -1;
              NSString *supportedChannelWidth = @"";
              NSString *vhtChannelWidth = @"";
              int vhtChannelCenterSegment0 = -1;
              int vhtChannelCenterSegment1 = -1;
              NSString *securityType = @"";

              OsciumBeaconCaptureData * beaconData = (OsciumBeaconCaptureData*)beaconCaptureDataBuffer;
              if (beaconCaptureDataBufferLen >= OSCIUMBEACONCAPTUREDATA_HEADER_LEN
                  && beaconCaptureDataBufferLen >= (OSCIUMBEACONCAPTUREDATA_HEADER_LEN + beaconData->dataLength) ) {

                  count++;
                  NSLog(@"Received beacon #%d of size: %d on Channel %d",
                        count,
                        beaconData->dataLength,
                        (beaconData->radiotap.channel) );

                      beaconObject = beaconCaptureDataBuffer;

                      // Frame control
                      uint8_t *frameControlPtr = beaconObject + 12;
                      NSString *frameControl = @"";
                      for (int i = 0; i < 2; i++)
                      {
                          // Convert to binary
                          int fc = (int)*frameControlPtr;
                          NSString *frameControlString = [@(fc) stringValue];
                          NSUInteger decimalNumber = [frameControlString integerValue];
                          int index = 0;
                          NSString *frameControlItem = @"";
                          while (decimalNumber > 0)
                          {
                              frameControlItem = [[NSString stringWithFormat:@"%lu", decimalNumber&1] stringByAppendingString:frameControlItem];
                                 decimalNumber = decimalNumber>> 1;
                              ++index;
                          }
                          frameControl = [frameControl stringByAppendingString:[NSString stringWithFormat:@"%@", frameControlItem]];
                          frameControlPtr++;
                      }
                      NSLog(@"Frame control: %@", frameControl);

                      // Duration
                      uint8_t *durationPtr = beaconObject + 14;
                      NSString *duration = @"";
                      for (int i = 0; i < 2; i++)
                      {
                          int d = (int)*durationPtr;
                          NSString *durationString = [@(d) stringValue];
                          duration = [duration stringByAppendingString:[NSString stringWithFormat:@"%@", durationString]];
                          durationPtr++;
                      }
                    NSLog(@"Duration: %@", duration);

                      // DA
                              uint8_t *daPtr = beaconObject + 16;
                              NSString *da = @"";
                              for (int i = 0; i < 6; i++)
                              {
                                  NSString *d = @"";
                                  if (i== 5) {
                                      d = [NSString stringWithFormat:@"%02X", *daPtr];
                                  }
                                  else {
                                      d = [NSString stringWithFormat:@"%02X:", *daPtr];
                                  }
                                  da = [da stringByAppendingString:[NSString stringWithFormat:@"%@", d]];
                                  daPtr++;
                              }
                     NSLog(@"DA: %@", da);

                      // SA
                      uint8_t *saPtr = beaconObject + 22;
                      NSString *sa = @"";
                      for (int i = 0; i < 6; i++)
                      {
                          NSString *s = @"";
                          if (i== 5) {
                              s = [NSString stringWithFormat:@"%02X", *saPtr];
                          }
                          else {
                              s = [NSString stringWithFormat:@"%02X:", *saPtr];
                          }
                          sa = [sa stringByAppendingString:[NSString stringWithFormat:@"%@", s]];
                          saPtr++;
                      }
                      NSLog(@"SA: %@", sa);

                      // BSSID
                      uint8_t *bssidPtr = beaconObject + 28;
                      NSString *bssid = @"";
                      for (int i = 0; i < 6; i++)
                      {
                          NSString *b = @"";
                          if (i== 5) {
                              b = [NSString stringWithFormat:@"%02X", *bssidPtr];
                          }
                          else {
                              b = [NSString stringWithFormat:@"%02X:", *bssidPtr];
                          }
                          bssid = [bssid stringByAppendingString:[NSString stringWithFormat:@"%@", b]];
                          bssidPtr++;
                       }
                      NSLog(@"BSSID: %@", bssid);

                      // SEQCTL
                      uint8_t *seqctlPtr = beaconObject + 34;
                      NSString *seqctl = @"";
                      for (int i = 0; i < 2; i++)
                      {
                          // Convert to binary
                              int sc = (int)*seqctlPtr;
                              NSString *seqctlstring = [@(sc) stringValue];
                              NSUInteger decimalNumber = [seqctlstring integerValue];
                              int index = 0;
                              NSString *seqCtlItem = @"";
                              while (decimalNumber > 0)
                              {
                                  seqCtlItem = [[NSString stringWithFormat:@"%lu", decimalNumber&1] stringByAppendingString:seqCtlItem];
                                  decimalNumber = decimalNumber>> 1;
                                  ++index;
                              }
                          if (seqCtlItem.length < 8)
                          {
                              NSString *padding = @"";
                              for (int i = 0; i < 8 - seqCtlItem.length; i++)
                              {
                                  padding = [padding stringByAppendingString:@"0"];
                              }
                              seqCtlItem = [padding stringByAppendingString:[NSString stringWithFormat:@"%@", seqCtlItem]];
                          }
                          seqctl = [seqctl stringByAppendingString:[NSString stringWithFormat:@"%@", seqCtlItem]];
                                          seqctlPtr++;
                      }
                      NSLog(@"Seqctl: %@", seqctl);


                      // Timestamp
                      uint8_t *timestampPtr = beaconObject + 36;
                      NSString *timestampString = @"";
                      for (int i = 0; i < 6; i++)
                      {
                          NSString *t = @"";
                          t = [NSString stringWithFormat:@"%02X", *timestampPtr];

                          timestampString = [[NSString stringWithFormat:@"%@", t] stringByAppendingString:timestampString];
                          timestampPtr++;
                      }
                      uint64_t timestamp = 0;
                      NSScanner *scanner = [NSScanner scannerWithString:timestampString];
                      [scanner scanHexLongLong:&timestamp];
                      NSLog(@"Timestamp: %llu", timestamp);

                      // Beacon Interval
                      uint8_t *beaconIntervalPtr = beaconObject + 44;
                      NSString *beaconInterval = @"";
                      for (int i = 0; i < 2; i++)
                      {
                          int b = (int)*beaconIntervalPtr;
                          NSString *beaconIntervalString = [@(b) stringValue];
                          beaconInterval = [beaconInterval stringByAppendingString:[NSString stringWithFormat:@"%@", beaconIntervalString]];
                                       beaconIntervalPtr++;
                      }
                      NSLog(@"Beacon interval: %@", beaconInterval);

                      // Capability Info
                      NSString *capabilityInfoBits = @"";
                      NSString *capabilityInfo = @"";
                      uint8_t *capabilityInfoPtr = beaconObject + 46;
                      for (int i = 0; i < 2; i++)
                      {
                          // Convert to binary
                          int ci = (int)*capabilityInfoPtr;
                          NSString *capabilityInfoString = [@(ci) stringValue];
                          NSUInteger decimalNumber = [capabilityInfoString integerValue];
                          int index = 0;
                          NSString *capabilityInfoItem = @"";
                          while (decimalNumber > 0)
                          {
                              capabilityInfoItem = [[NSString stringWithFormat:@"%lu", decimalNumber&1] stringByAppendingString:capabilityInfoItem];
                              decimalNumber = decimalNumber>> 1;
                              ++index;
                          }
                          if (capabilityInfoItem.length < 8)
                          {
                              NSString *padding = @"";
                              for (int i = 0; i < 8 - capabilityInfoItem.length; i++)
                              {
                                  padding = [padding stringByAppendingString:@"0"];
                              }
                              capabilityInfoItem = [padding stringByAppendingString:[NSString stringWithFormat:@"%@", capabilityInfoItem]];
                          }

                          NSMutableDictionary<NSString *, NSString *> *capabilityInfoDictionary = [[NSMutableDictionary alloc]init];
                          NSUInteger len = [capabilityInfoItem length];
                          unichar buffer[len+1];
                          NSString *val = @"";
                          NSString *keyName = @"";

                          [capabilityInfoItem getCharacters:buffer range:NSMakeRange(0, len)];

                          if (i == 0)
                          {

                              for(int j = 0; j < len; j++) {
                                  val = [NSString stringWithFormat:@"%C", buffer[j]];
                                  if (j == 7)
                                  {
                                      keyName = @"ESS";
                                  }
                                  if (j == 6)
                                  {
                                      keyName = @"IBSS";
                                  }
                                  if (j == 5)
                                  {
                                      keyName = @"CF Pollable";
                                  }
                                  if (j == 4)
                                  {
                                      keyName = @"CF-Poll Request";
                                  }
                                  if (j == 3)
                                  {
                                      keyName = @"Privacy";
                                  }
                                  if (j == 2)
                                  {
                                      keyName = @"Short Preamble";
                                  }
                                  if (j == 1)
                                  {
                                      keyName = @"PBCC";
                                  }
                                  if (j == 0)
                                  {
                                      keyName = @"Channel Agility";
                                  }
                                  [capabilityInfoDictionary setObject:val forKey:keyName];
                              }
                          }
                          else
                          {
                              for(int j = 0; j < len; j++) {
                                          val = [NSString stringWithFormat:@"%C", buffer[j]];
                                          if (j == 7)
                                          {
                                              keyName = @"Spectrum Management";
                                          }
                                          if (j == 6)
                                          {
                                              keyName = @"QoS";
                                          }
                                          if (j == 5)
                                          {
                                              keyName = @"Short Slot Time";
                                          }
                                          if (j == 4)
                                          {
                                              keyName = @"APSD";
                                          }
                                          if (j == 3)
                                          {
                                              keyName = @"Radio Measurement";
                                          }
                                          if (j == 2)
                                          {
                                              keyName = @"Reserved";
                                          }
                                          if (j == 1)
                                          {
                                              keyName = @"Delayed Block Ack";
                                          }
                                          if (j == 0)
                                          {
                                              keyName = @"Immediate Block Ack";
                                          }

                                          [capabilityInfoDictionary setObject:val forKey:keyName];

                                      }
                          }

                      for(NSString *key in capabilityInfoDictionary) {
                      NSLog(@"%@",key);
                      NSLog(@"value: %@",[capabilityInfoDictionary valueForKey:key]);
                      }

                      capabilityInfoBits = [capabilityInfoBits stringByAppendingString:[NSString stringWithFormat:@"%@", capabilityInfoItem]];
                                      capabilityInfoPtr++;

                      }

                      uint8_t *nextBeaconElement = beaconObject + MAC_HEADER_LENGTH;
                      BOOL doneWithSSID = NO;
                      for (int i = 0; i < 18; i++)
                      {
                          if (*nextBeaconElement == SSID_ELEMENT_ID)
                          {
                                        NSLog(@"Extracting SSID");
                                        // SSID
                                        uint8_t *ssidLengthPtr = beaconObject + MAC_HEADER_LENGTH + 1;
                                        SSID_ELEMENT_LENGTH = (int)*ssidLengthPtr;
                                        uint8_t *ssidPtr = beaconObject + MAC_HEADER_LENGTH + 2;

                                        char ssidChar;

                                        int i=1;
                                        while(i<=SSID_ELEMENT_LENGTH && !doneWithSSID)
                                        //for (int i = 0; i <= SSID_ELEMENT_LENGTH; i++)
                                        {
                                            ssidChar = *ssidPtr;
                                            ssidString = [ssidString stringByAppendingString:[NSString stringWithFormat:@"%c", ssidChar]];
                                            ssidPtr++;
                                          i++;
                                        }
                                        SSID_ELEMENT_LENGTH += 2;

                                        doneWithSSID = YES;
                                       RCTLog(@"SSID: A%@A", ssidString);
                                       NSLog(@"SSID: %@", ssidString);
                          }
                          if (*nextBeaconElement == SUPPORTED_RATES_ELEMENT_ID)
                          {
                              NSLog(@"Extracting supported rates");
                              // Supported Rates
                              uint8_t *supportedRatesPtr = beaconObject + MAC_HEADER_LENGTH + SSID_ELEMENT_LENGTH;
                              uint8_t *supportedRatesLength = supportedRatesPtr + 1;
                              SUPPORTED_RATES_ELEMENT_LENGTH = (int)*supportedRatesLength;
                              for (int i = 0; i < SUPPORTED_RATES_ELEMENT_LENGTH; i++)
                              {
                                  NSString *s = @"";
                                  s = [NSString stringWithFormat:@"%i ", *supportedRatesPtr];
                                  supportedRates = [supportedRates stringByAppendingString:[NSString stringWithFormat:@"%@", s]];
                                          supportedRatesPtr++;
                              }
                              SUPPORTED_RATES_ELEMENT_LENGTH += 2;
                              NSLog(@"Supported rates: %@", supportedRates);
                          }
                          if (*nextBeaconElement == DSSS_PARAMETER_ELEMENT_ID)
                          {
                              NSLog(@"Extracting DS Parameter");
                              // DS Parameter
                              uint8_t *dsParamPtr = (beaconObject + MAC_HEADER_LENGTH + SSID_ELEMENT_LENGTH + SUPPORTED_RATES_ELEMENT_LENGTH);
                              dsParamPtr += 2;
                              dsParameter = (int8_t)*dsParamPtr;
                              DSSS_PARAMETER_ELEMENT_LENGTH = 3;
                              NSLog(@"DSSS: %i", dsParameter);
                          }
                          if (*nextBeaconElement == CF_PARAMETER_ELEMENT_ID)
                          {
                              NSLog(@"Extracting CF Parameter");
                              // CF Parameter
                              uint8_t *cfPtr = (beaconObject + MAC_HEADER_LENGTH + SSID_ELEMENT_LENGTH + SUPPORTED_RATES_ELEMENT_LENGTH + DSSS_PARAMETER_ELEMENT_LENGTH);
                                                             uint8_t *CFLength = cfPtr + 1;
                                                             CF_PARAMETER_ELEMENT_LENGTH = (int)*CFLength;
                                                             cfPtr += 2;
                                                             for (int i = 0; i < *CFLength; i++)
                                                             {
                                                                 NSString *c = @"";
                                                                 c = [NSString stringWithFormat:@"%i ", *cfPtr];
                                                                 cfParameter = [cfParameter stringByAppendingString:[NSString stringWithFormat:@"%@", c]];
                                                                 cfPtr++;
                                                             }
                                                             CF_PARAMETER_ELEMENT_LENGTH += 2;
                              NSLog(@"CF Parameter: %@", cfParameter);

                          }
                          if (*nextBeaconElement == TIM_ELEMENT_ID)
                          {
                              NSLog(@"Extracting TIM");
                              // TIM
                              uint8_t *timPtr = (beaconObject + MAC_HEADER_LENGTH + SSID_ELEMENT_LENGTH + SUPPORTED_RATES_ELEMENT_LENGTH + DSSS_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH);
                              uint8_t *TIMLength = timPtr + 1;
                              TIM_ELEMENT_LENGTH = (int)*TIMLength;
                              timPtr += 2;
                              for (int i = 0; i < *TIMLength; i++)
                              {
                                  NSString *t = @"";
                                  t = [NSString stringWithFormat:@"%i ", *timPtr];
                                  tim = [tim stringByAppendingString:[NSString stringWithFormat:@"%@", t]];
                                  timPtr++;
                              }
                              TIM_ELEMENT_LENGTH += 2;
                              NSLog(@"TIM: %@", tim);
                          }
                          if (*nextBeaconElement == IBSS_PARAMETER_ELEMENT_ID)
                          {
                              NSLog(@"Extracting IBSS Parameter");
                              uint8_t *ibssPtr = (beaconObject + MAC_HEADER_LENGTH + SSID_ELEMENT_LENGTH + SUPPORTED_RATES_ELEMENT_LENGTH + DSSS_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + + TIM_ELEMENT_LENGTH);
                              uint8_t *ibssLength = ibssPtr + 1;
                              IBSS_PARAMETER_ELEMENT_LENGTH = (int)*ibssLength;
                              IBSS_PARAMETER_ELEMENT_LENGTH += 2;
                          }
                          if (*nextBeaconElement == COUNTRY_ELEMENT_ID)
                          {
                              NSLog(@"Extracting country");
                              // Country
                              uint8_t *countryPtr = (beaconObject + MAC_HEADER_LENGTH + SSID_ELEMENT_LENGTH + SUPPORTED_RATES_ELEMENT_LENGTH + DSSS_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + + TIM_ELEMENT_LENGTH + IBSS_PARAMETER_ELEMENT_LENGTH);
                              uint8_t *countryLength = countryPtr + 1;
                              COUNTRY_ELEMENT_LENGTH = (int)*countryLength;
                              countryPtr += 2;
                              for (int i = 0; i < *countryLength; i++)
                              {
                                  char countryChar;
                                  if (i < 3)
                                  {
                                      countryChar = *countryPtr;
                                      country = [country stringByAppendingString:[NSString stringWithFormat:@"%c", countryChar]];
                                  }
                                  else
                                  {
                                      country = [country stringByAppendingString:[NSString stringWithFormat:@" %i ", *countryPtr]];
                                  }
                                  countryPtr++;
                              }
                              COUNTRY_ELEMENT_LENGTH += 2;
                              NSLog(@"Country: %@", country);
                          }
                          if (*nextBeaconElement == BSS_LOAD_ELEMENT_ID)
                          {
                              NSLog(@"Extracting BSS load");
                              uint8_t *BSSLoadPtr = (beaconObject + MAC_HEADER_LENGTH + SSID_ELEMENT_LENGTH + SUPPORTED_RATES_ELEMENT_LENGTH + DSSS_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + TIM_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + IBSS_PARAMETER_ELEMENT_LENGTH + COUNTRY_ELEMENT_LENGTH);
                              uint8_t *BSSLoadLength = BSSLoadPtr + 1;
                              BSS_LOAD_ELEMENT_LENGTH = (int)*BSSLoadLength;
                              BSSLoadPtr += 2;

                              for (int i = 0; i < *BSSLoadLength; i++)
                              {
                                  NSString *b = @"";
                                  b = [NSString stringWithFormat:@"%i ", *BSSLoadPtr];
                                  bssLoad = [tim stringByAppendingString:[NSString stringWithFormat:@"%@", b]];
                                  BSSLoadPtr++;
                              }
                              BSS_LOAD_ELEMENT_LENGTH += 2;
                              NSLog(@"BSS Load: %@", bssLoad);
                          }
                          if (*nextBeaconElement == POWER_CONSTRAINT_ELEMENT_ID)
                          {
                              NSLog(@"Extracting power constraint");
                              uint8_t *powerConstraintPtr = (beaconObject + MAC_HEADER_LENGTH + SSID_ELEMENT_LENGTH + SUPPORTED_RATES_ELEMENT_LENGTH + DSSS_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + TIM_ELEMENT_LENGTH + IBSS_PARAMETER_ELEMENT_LENGTH + COUNTRY_ELEMENT_LENGTH + BSS_LOAD_ELEMENT_LENGTH);
                              powerConstraintPtr += 2;
                              POWER_CONSTRAINT_ELEMENT_LENGTH = 3;
                          }
                          if (*nextBeaconElement == TPC_REPORT_ELEMENT_ID)
                          {
                              NSLog(@"Extracting TPC report");
                          }
                          if (*nextBeaconElement == CHANNEL_SWITCH_ELEMENT_ID)
                          {
                              NSLog(@"Extracting channel switch");
                          }
                          if (*nextBeaconElement == QUIET_ELEMENT_ID)
                          {
                              NSLog(@"Extracting quiet");
                          }
                          if (*nextBeaconElement == ERP_ELEMENT_ID)
                          {
                              NSLog(@"Extracting ERP");
                              // ERP
                              uint8_t *erpPtr = (beaconObject + MAC_HEADER_LENGTH + SSID_ELEMENT_LENGTH + SUPPORTED_RATES_ELEMENT_LENGTH + DSSS_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + TIM_ELEMENT_LENGTH + IBSS_PARAMETER_ELEMENT_LENGTH + COUNTRY_ELEMENT_LENGTH + BSS_LOAD_ELEMENT_LENGTH + POWER_CONSTRAINT_ELEMENT_LENGTH + TPC_REPORT_ELEMENT_LENGTH + CHANNEL_SWITCH_ELEMENT_LENGTH + QUIET_ELEMENT_LENGTH);
                              erpPtr += 2;
                              ERP_ELEMENT_LENGTH = 3;
                          }
                          if (*nextBeaconElement == HT_CAPABILITIES_ELEMENT_ID)
                          {
                              NSLog(@"Extracting HT Capabilites");
                              uint8_t *HTPtr = (beaconObject + MAC_HEADER_LENGTH + SSID_ELEMENT_LENGTH + SUPPORTED_RATES_ELEMENT_LENGTH + DSSS_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + TIM_ELEMENT_LENGTH + IBSS_PARAMETER_ELEMENT_LENGTH + COUNTRY_ELEMENT_LENGTH + BSS_LOAD_ELEMENT_LENGTH + POWER_CONSTRAINT_ELEMENT_LENGTH + TPC_REPORT_ELEMENT_LENGTH + CHANNEL_SWITCH_ELEMENT_LENGTH + QUIET_ELEMENT_LENGTH + ERP_ELEMENT_LENGTH);
                              uint8_t *HTLength = HTPtr + 1;
                              HT_CAPABILITIES_ELEMENT_LENGTH = (int)*HTLength;
                              HT_CAPABILITIES_ELEMENT_LENGTH += 2;
                          }
                          if (*nextBeaconElement == RSN_ELEMENT_ID)
                                        {
                                            NSLog(@"Extracting RSN");

                                            uint8_t *RSNPtr =  (beaconObject + MAC_HEADER_LENGTH + SSID_ELEMENT_LENGTH + SUPPORTED_RATES_ELEMENT_LENGTH + DSSS_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + TIM_ELEMENT_LENGTH + IBSS_PARAMETER_ELEMENT_LENGTH + COUNTRY_ELEMENT_LENGTH + BSS_LOAD_ELEMENT_LENGTH + POWER_CONSTRAINT_ELEMENT_LENGTH + TPC_REPORT_ELEMENT_LENGTH + CHANNEL_SWITCH_ELEMENT_LENGTH + QUIET_ELEMENT_LENGTH + ERP_ELEMENT_LENGTH + HT_CAPABILITIES_ELEMENT_LENGTH);
                                            uint8_t *RSNLength = RSNPtr + 1;
                                            RSN_ELEMENT_LENGTH = (int)*RSNLength;
                                            RSNPtr += 2;

                                            NSString *groupCipherSuite = @"";
                                            int groupCipherSuiteInt = -1;

                                            NSString *pairwiseCipherSuite = @"";
                                            int pairwiseCipherSuiteInt = -1;

                                            NSString *akmSuite = @"";
                                            int akmSuiteInt = -1;


                                            for (int i = 0; i < *RSNLength; i++)
                                            {
                                                if (i == 5)
                                                {
                                                    groupCipherSuiteInt = (int)*RSNPtr;
                                                    if (groupCipherSuiteInt == 1)
                                                    {
                                                        groupCipherSuite = @"WEP-40";
                                                    }
                                                    if (groupCipherSuiteInt == 2)
                                                    {
                                                        groupCipherSuite = @"TKIP";
                                                    }
                                                    if (groupCipherSuiteInt == 4)
                                                    {
                                                        groupCipherSuite = @"CCMP";
                                                    }
                                                    if (groupCipherSuiteInt == 5)
                                                    {
                                                        groupCipherSuite = @"WEP-104";
                                                    }
                                                }
                                                if (i == 11)
                                                {
                                                    pairwiseCipherSuiteInt = (int)*RSNPtr;
                                                    if (pairwiseCipherSuiteInt == 1)
                                                    {
                                                        pairwiseCipherSuite = @"WEP-40";
                                                    }
                                                    if (pairwiseCipherSuiteInt == 2)
                                                    {
                                                        pairwiseCipherSuite = @"TKIP";
                                                    }
                                                    if (pairwiseCipherSuiteInt == 4)
                                                    {
                                                        pairwiseCipherSuite = @"CCMP";
                                                    }
                                                    if (pairwiseCipherSuiteInt == 5)
                                                    {
                                                        pairwiseCipherSuite = @"WEP-104";
                                                    }
                                                }
                                                if (i == 17)
                                                {
                                                    akmSuiteInt = (int)*RSNPtr;
                                                    if (akmSuiteInt == 1)
                                                    {
                                                        akmSuite = @"802.1X";
                                                    }
                                                    if (akmSuiteInt == 2)
                                                    {
                                                        akmSuite = @"PSK";
                                                    }
                                                    if (akmSuiteInt == 3)
                                                    {
                                                        akmSuite = @"FT over 802.1X";
                                                    }
                                                }
                                                RSNPtr++;
                                            }
                                            RSN_ELEMENT_LENGTH += 2;
                                            NSLog(@"Group: %@", groupCipherSuite);
                                            NSLog(@"Pairwise: %@", pairwiseCipherSuite);
                                            NSLog(@"AKM: %@", akmSuite);


                                            if (groupCipherSuiteInt == 1 || groupCipherSuiteInt == 5)
                                            {
                                                securityType = @"WEP";
                                            }
                                            if (groupCipherSuiteInt == 2 && pairwiseCipherSuiteInt == 2)
                                            {
                                                securityType = @"WPA";
                                            }
                                            if (groupCipherSuiteInt == 2 || pairwiseCipherSuiteInt == 2 || pairwiseCipherSuiteInt == 4)
                                            {
                                                securityType = @"WPA/WPA2";
                                            }
                                            if (akmSuiteInt == 2)
                                            {
                                                securityType = @"WPA Personal";
                                            }
                                            if (akmSuiteInt == 1)
                                            {
                                                securityType = @"WPA Enterprise";
                                            }
                                            NSLog(@"Security Type: %@", securityType);
                                        }



                          if (*nextBeaconElement == EXTENDED_RATES_ELEMENT_ID)
                          {
                              NSLog(@"Extracting extended rates");
                              // Extended support rates
                              uint8_t *esrPtr = (beaconObject + MAC_HEADER_LENGTH + SSID_ELEMENT_LENGTH + SUPPORTED_RATES_ELEMENT_LENGTH + DSSS_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + TIM_ELEMENT_LENGTH + IBSS_PARAMETER_ELEMENT_LENGTH + COUNTRY_ELEMENT_LENGTH + BSS_LOAD_ELEMENT_LENGTH + POWER_CONSTRAINT_ELEMENT_LENGTH + TPC_REPORT_ELEMENT_LENGTH + CHANNEL_SWITCH_ELEMENT_LENGTH + QUIET_ELEMENT_LENGTH + ERP_ELEMENT_LENGTH + HT_CAPABILITIES_ELEMENT_LENGTH + RSN_ELEMENT_LENGTH);
                              uint8_t *esrLength = esrPtr + 1;
                              EXTENDED_RATES_ELEMENT_LENGTH = (int)*esrLength;
                              EXTENDED_RATES_ELEMENT_LENGTH += 2;
                          }
                          if (*nextBeaconElement == MOBILITY_DOMAIN_ELEMENT_ID)
                          {
                              NSLog(@"Extracting Mobility Domain");
                              uint8_t *mdPtr = (beaconObject + MAC_HEADER_LENGTH + SSID_ELEMENT_LENGTH + SUPPORTED_RATES_ELEMENT_LENGTH + DSSS_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + TIM_ELEMENT_LENGTH + IBSS_PARAMETER_ELEMENT_LENGTH + COUNTRY_ELEMENT_LENGTH + BSS_LOAD_ELEMENT_LENGTH + POWER_CONSTRAINT_ELEMENT_LENGTH + TPC_REPORT_ELEMENT_LENGTH + CHANNEL_SWITCH_ELEMENT_LENGTH + QUIET_ELEMENT_LENGTH + ERP_ELEMENT_LENGTH + HT_CAPABILITIES_ELEMENT_LENGTH + RSN_ELEMENT_LENGTH + EXTENDED_RATES_ELEMENT_LENGTH);
                              uint8_t *mdLength = mdPtr + 1;
                              MOBILITY_DOMAIN_ELEMENT_LENGTH = (int)*mdLength;
                              MOBILITY_DOMAIN_ELEMENT_LENGTH += 2;
                          }
                          NSLog(@"%d", *nextBeaconElement);
                          if (*nextBeaconElement == HT_OPERATION_ELEMENT_ID)
                                                     {
                                                         NSLog(@"Extracting HT operation");
                                                         // HT operation
                                                         uint8_t *htOperationPtr = (beaconObject + MAC_HEADER_LENGTH + SSID_ELEMENT_LENGTH + SUPPORTED_RATES_ELEMENT_LENGTH + DSSS_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + TIM_ELEMENT_LENGTH + IBSS_PARAMETER_ELEMENT_LENGTH + COUNTRY_ELEMENT_LENGTH + BSS_LOAD_ELEMENT_LENGTH + POWER_CONSTRAINT_ELEMENT_LENGTH + TPC_REPORT_ELEMENT_LENGTH + CHANNEL_SWITCH_ELEMENT_LENGTH + QUIET_ELEMENT_LENGTH + ERP_ELEMENT_LENGTH + HT_CAPABILITIES_ELEMENT_LENGTH + RSN_ELEMENT_LENGTH + EXTENDED_RATES_ELEMENT_LENGTH + MOBILITY_DOMAIN_ELEMENT_LENGTH);
                                                         uint8_t *htOperationLength = htOperationPtr + 1;
                                                         HT_OPERATION_ELEMENT_LENGTH = (int)*htOperationLength;
                                                         htOperationPtr += 2;

                                                         for (int i = 0;  i < *htOperationLength; i++)
                                                         {
                                                             if (i == 0)
                                                             {
                                                                 primaryChannel = *htOperationPtr;
                                                             }
                                                             if (i == 1)
                                                             {
                                                                 if (*htOperationPtr == 0)
                                                                 {
                                                                     supportedChannelWidth = @"20 Mhz";
                                                                 }
                                                                 if ([supportedChannelWidth isEqual:@"1"])
                                                                 {
                                                                     supportedChannelWidth = @"Any width supported";
                                                                 }
                                                             }
                                                             htOperationPtr++;
                                                         }

                                                         HT_OPERATION_ELEMENT_LENGTH += 2;
                                                         NSLog(@"Supported channel width: %@", supportedChannelWidth);
                                                         NSLog(@"Primary channel: %i", primaryChannel);
                                                     }

                          if (*nextBeaconElement == VHT_OPERATION_ELEMENT_ID)
                          {
                              NSLog(@"Extracting VHT operation");
                              // VHT operation
                              uint8_t *vhtOperationPtr = (beaconObject + MAC_HEADER_LENGTH + SSID_ELEMENT_LENGTH + SUPPORTED_RATES_ELEMENT_LENGTH + DSSS_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + TIM_ELEMENT_LENGTH + IBSS_PARAMETER_ELEMENT_LENGTH + COUNTRY_ELEMENT_LENGTH + BSS_LOAD_ELEMENT_LENGTH + POWER_CONSTRAINT_ELEMENT_LENGTH + TPC_REPORT_ELEMENT_LENGTH + CHANNEL_SWITCH_ELEMENT_LENGTH + QUIET_ELEMENT_LENGTH + ERP_ELEMENT_LENGTH + HT_CAPABILITIES_ELEMENT_LENGTH + RSN_ELEMENT_LENGTH + EXTENDED_RATES_ELEMENT_LENGTH + MOBILITY_DOMAIN_ELEMENT_LENGTH + HT_OPERATION_ELEMENT_LENGTH);
                              uint8_t *vhtOperationLength = vhtOperationPtr + 1;

                              VHT_OPERATION_ELEMENT_LENGTH = (int)*vhtOperationLength;
                              vhtOperationPtr += 2;

                              for (int i = 0; i < VHT_OPERATION_ELEMENT_LENGTH; i++)
                              {
                                  if (i == 0)
                                  {
                                      if (*vhtOperationPtr == 0)
                                      {
                                          vhtChannelWidth = @"20 MHz or 40 MHz";
                                      }
                                      if (*vhtOperationPtr == 1)
                                      {
                                          vhtChannelWidth = @"80 MHz, 160 MHz or 80+80 MHz";
                                      }
                                      if (*vhtOperationPtr == 2)
                                      {
                                          vhtChannelWidth = @"160 MHz";
                                      }
                                      if (*vhtOperationPtr == 3)
                                      {
                                          vhtChannelWidth = @"Non-contiguous 80+80 MHz";
                                      }
                                  }
                                  if (i == 1)
                                  {
                                      vhtChannelCenterSegment0 = (int)*vhtOperationPtr;
                                  }
                                  if (i == 2)
                                  {
                                      vhtChannelCenterSegment1 = (int)*vhtOperationPtr;
                                  }
                              }

                              VHT_OPERATION_ELEMENT_LENGTH += 2;
                              NSLog(@"VHT Channel width: %@", vhtChannelWidth);
                              NSLog(@"VHT Channel center segment 0: %i", vhtChannelCenterSegment0);
                              NSLog(@"VHT Channel center segment 1: %i", vhtChannelCenterSegment1);

                          }

                         /*RCTLog(@"SSID_ELEMENT_LENGTH: %d", SSID_ELEMENT_LENGTH);
                         RCTLog(@"SUPPORTED_RATES_ELEMENT_LENGTH: %d", SUPPORTED_RATES_ELEMENT_LENGTH);
                         RCTLog(@"DSSS_PARAMETER_ELEMENT_LENGTH: %d", DSSS_PARAMETER_ELEMENT_LENGTH);
                         RCTLog(@"CF_PARAMETER_ELEMENT_LENGTH: %d", CF_PARAMETER_ELEMENT_LENGTH);
                         RCTLog(@"TIM_ELEMENT_LENGTH: %d", TIM_ELEMENT_LENGTH);
                         RCTLog(@"IBSS_PARAMETER_ELEMENT_LENGTH: %d", IBSS_PARAMETER_ELEMENT_LENGTH);
                         RCTLog(@"COUNTRY_ELEMENT_LENGTH: %d", COUNTRY_ELEMENT_LENGTH);
                         RCTLog(@"BSS_LOAD_ELEMENT_LENGTH: %d", BSS_LOAD_ELEMENT_LENGTH);
                         RCTLog(@"POWER_CONSTRAINT_ELEMENT_LENGTH: %d", POWER_CONSTRAINT_ELEMENT_LENGTH);
                         RCTLog(@"CHANNEL_SWITCH_ELEMENT_LENGTH: %d", CHANNEL_SWITCH_ELEMENT_LENGTH);
                         RCTLog(@"QUIET_ELEMENT_LENGTH: %d", QUIET_ELEMENT_LENGTH);
                         RCTLog(@"TPC_REPORT_ELEMENT_LENGTH: %d", TPC_REPORT_ELEMENT_LENGTH);
                         RCTLog(@"ERP_ELEMENT_LENGTH: %d", ERP_ELEMENT_LENGTH);
                         RCTLog(@"HT_CAPABILITIES_ELEMENT_LENGTH: %d", HT_CAPABILITIES_ELEMENT_LENGTH);
                         RCTLog(@"RSN_ELEMENT_LENGTH: %d", RSN_ELEMENT_LENGTH);
                         RCTLog(@"EXTENDED_RATES_ELEMENT_LENGTH: %d", EXTENDED_RATES_ELEMENT_LENGTH);
                         RCTLog(@"MOBILITY_DOMAIN_ELEMENT_LENGTH: %d", MOBILITY_DOMAIN_ELEMENT_LENGTH);
                         RCTLog(@"HT_OPERATION_ELEMENT_LENGTH: %d", HT_OPERATION_ELEMENT_LENGTH);*/
                          nextBeaconElement = (beaconObject + MAC_HEADER_LENGTH + SSID_ELEMENT_LENGTH + SUPPORTED_RATES_ELEMENT_LENGTH + DSSS_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + CF_PARAMETER_ELEMENT_LENGTH + TIM_ELEMENT_LENGTH + IBSS_PARAMETER_ELEMENT_LENGTH + COUNTRY_ELEMENT_LENGTH + BSS_LOAD_ELEMENT_LENGTH + POWER_CONSTRAINT_ELEMENT_LENGTH + TPC_REPORT_ELEMENT_LENGTH + CHANNEL_SWITCH_ELEMENT_LENGTH + QUIET_ELEMENT_LENGTH + ERP_ELEMENT_LENGTH + HT_CAPABILITIES_ELEMENT_LENGTH + RSN_ELEMENT_LENGTH + EXTENDED_RATES_ELEMENT_LENGTH + MOBILITY_DOMAIN_ELEMENT_LENGTH + HT_OPERATION_ELEMENT_LENGTH);

                      }
                      // RSSI
                      int8_t rssi = beaconData->radiotap.RSSI;
                      //NSLog(@"RSSI (from radio tap): %i", rssi);

                      // Channel
                      uint16_t channel = beaconData->radiotap.channel;
                     //NSLog(@"Channel (from radio tap): %i", channel);
                     //RCTLog(@"converting uint_8 to int");
                     int primaryChannelUint8 = (int) primaryChannel;
                     //RCTLog(@"Primary channel: %d", primaryChannelUint8);
                  //RCTLog(@"SSID: %@, BSSID: %@, rssi (signal strength): %d, radiotap channel: %u, primary channel: %hhu, center channel: %d, vhtChannelWidth: %@",ssidString, bssid, rssi, channel, primaryChannel, vhtChannelCenterSegment0, vhtChannelWidth);
                  //add this scan item to the list
                  //NSArray* singleScan = @[ssidString, bssid, [NSNumber numberWithInt:rssi], [NSNumber numberWithInt:channel]];
                NSDictionary* singleScan = @{@"SSID" : ssidString, @"BSSID" : bssid, @"signal" : [NSNumber numberWithInt:rssi], @"channel" : [NSNumber numberWithInt:channel]};
                  //assign results to the object
                  [scanResults addObject:singleScan];

                  // update remaining length and pointer
                  beaconCaptureDataBufferLen -= (OSCIUMBEACONCAPTUREDATA_HEADER_LEN + beaconData->dataLength);
                  beaconCaptureDataBuffer += (OSCIUMBEACONCAPTUREDATA_HEADER_LEN + beaconData->dataLength);

              } else {
                  break;
              }
          }
      } else {
          NSLog(@"Beacon Capture received has incorrect len.");
      }
      RCTLog(@"Completed a full scan");
      [WipryManager sendEventWithName:@"ScanComplete" body:scanResults];
      NSLog(@"-------");
  }
};

@interface WipryManager () {
  oscium::WiPry2500x * wipry2500x;
  MyWiPry2500xDelegate * wipry2500xDelegate;
}

- (void)_accessoryDidConnect:(NSNotification *)notification;
- (void)_accessoryDidDisconnect:(NSNotification *)notification;

@end

@implementation WipryManager

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"WipryConnected",@"WipryDisconnected", @"ScanComplete"];
}

- (void)WipryConnectedEvent:(NSNotification *)notification
{
  //[self sendEventWithName:@"WipryConnected" body:nil];
}

RCT_EXPORT_METHOD(deviceConnected:(RCTResponseSenderBlock)callback)
{
  RCTLogInfo(@"Checking if Oscium device is connected");
  BOOL returnValue = YES;
  //[self sendEventWithName:@"WipryConnected" body:nil];
  callback(@[[NSNumber numberWithBool:returnValue]]);
}

RCT_EXPORT_METHOD(initializeDevice:(RCTResponseSenderBlock)callback)
{
  [self initializeModule];
  RCTLog(@"RCTLog works");
  callback(@[[NSNull null]]);
}

RCT_EXPORT_METHOD(scan:(RCTResponseSenderBlock)callback)
{
  [self _startBeaconCapture];
  //wipry2500x->startBeaconCapture(false);
  callback(@[[NSNull null]]);
}


- (void)_connectToAccessory:(EAAccessory*) accessory {
  if (accessory == nil) {
    RCTLog(@"Accessory was null");
    return;
  }

  RCTLog(@"Connected Accessory: %@", accessory);

  // create the WiPry5x object with the accessory to communicate with the accessory
  wipry2500x = new oscium::WiPry2500x((__bridge_retained void*)accessory);

  // create the delegate
  wipry2500xDelegate = new MyWiPry2500xDelegate();
  wipry2500xDelegate->WipryManager = self;
  wipry2500x->setDelegate(wipry2500xDelegate);

  // start the communication
  wipry2500x->startCommunication();

  [self sendEventWithName:@"WipryConnected" body:nil];
  //self.dataStreamStarted = false;
}

- (void)initializeModule {
  RCTLog(@"Inside initialize module");
  // Do any additional setup after loading the view, typically from a nib.
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(_accessoryDidConnect:) name:EAAccessoryDidConnectNotification object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(_accessoryDidDisconnect:) name:EAAccessoryDidDisconnectNotification object:nil];
  [[EAAccessoryManager sharedAccessoryManager] registerForLocalNotifications];
  /*self.isConnected = false;
  self.dataStreamStarted = false;
  self.batteryLevelStreamStarted = false;*/

  // Do an initial check for connected accessories since a connect notification
  //   will not be received if the accessory was connected before the app had started
  [self initialAccessoryCheckAndConnect];
}

- (void) initialAccessoryCheckAndConnect {
  EAAccessoryManager * eaManager = [EAAccessoryManager sharedAccessoryManager];
  EAAccessory * connectedAccessory = [[eaManager connectedAccessories] firstObject];

  [self _connectToAccessory:connectedAccessory];
}

- (void)_accessoryDidConnect:(NSNotification *)notification {
  EAAccessory *connectedAccessory = [[notification userInfo] objectForKey:EAAccessoryKey];

  [self _connectToAccessory:connectedAccessory];

}

- (void)_accessoryDidDisconnect:(NSNotification *)notification {
  EAAccessory *disconnectedAccessory = [[notification userInfo] objectForKey:EAAccessoryKey];
  NSLog(@"Disconnected Accessory: %@", disconnectedAccessory);

  // delete the WiPry5x object
  if (wipry2500x != nullptr) {
    if (wipry2500x->didStartCommunication())
      wipry2500x->endCommunication();

    delete wipry2500x;
  }
  wipry2500x = nullptr;

  // delete the delegate
  if (wipry2500xDelegate != nullptr) {
    wipry2500xDelegate->WipryManager = nil;

    delete wipry2500xDelegate;
  }
  wipry2500xDelegate = nullptr;

  [self sendEventWithName:@"WipryDisconnected" body:nil];
}

- (void)_startBeaconCapture {
  if(wipry2500x != nil) {
    wipry2500x->startBeaconCapture(false);
  }
  else {
    RCTLog(@"Could not start scan, need to reconnect module");
  }
}

@end
