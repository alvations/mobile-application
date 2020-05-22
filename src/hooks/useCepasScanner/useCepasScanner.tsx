import { useState, useCallback, useEffect, useRef } from "react";
import NfcManager, { Ndef, NfcTech } from "react-native-nfc-manager";

export type ScannerState =
  | "STARTED"
  | "PAUSED/CARD_DETECTED"
  | "PAUSED/CAN_ID_DETECTED";

export type CepasScannerHook = {
  scannerState: ScannerState;
  resume: () => void;
  pause: () => void;
  detectedCanId: string;
  error?: Error;
};

const getCanId = async (): Promise<string> => {
  await NfcManager.transceive([0x00, 0xa4, 0x00, 0x00, 0x02, 0x40, 0x00]);
  const res = await NfcManager.transceive([0x90, 0x32, 0x03, 0x00, 0x00]);
  const canIDBytes = res.slice(8, 16);
  const canID = Ndef.util.bytesToHexString(canIDBytes);
  return canID;
};

export class InvalidCardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCardError";
  }
}

export class DuplicateCardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateCardError";
  }
}

export class CardMovedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CardMovedError";
  }
}

export const useCepasScanner = (): CepasScannerHook => {
  const [scannerState, setScannerState] = useState<ScannerState>("STARTED");
  const [detectedCanId, setDetectedCanId] = useState("");
  const [error, setError] = useState<Error>();

  const prevId = useRef("");

  const pause = async (): Promise<void> => {
    console.log("pause");
    await NfcManager.cancelTechnologyRequest();
    await NfcManager.unregisterTagEvent();
  };

  const scan = useCallback(() => {
    const listenForEvent = async (): Promise<void> => {
      try {
        setDetectedCanId("");
        setError(undefined);
        setScannerState("STARTED");
        await NfcManager.registerTagEvent();
        console.log("ready to scan");
        await NfcManager.requestTechnology(NfcTech.IsoDep);

        setScannerState("PAUSED/CARD_DETECTED");
        const tag = await NfcManager.getTag();
        if (prevId.current !== tag.id) {
          prevId.current = tag.id;
          const canId = await getCanId();
          if (!canId) {
            throw new InvalidCardError(
              "Card does not have a CAN ID. Supported cards have a CAN ID on its underside."
            );
          }
          setScannerState("PAUSED/CAN_ID_DETECTED");
          setDetectedCanId(canId);
        } else {
          throw new DuplicateCardError(
            "Card is the same as the previous detected card. Please scan a different card."
          );
        }
        await pause();
      } catch (e) {
        await pause();
        switch (e) {
          case "you should requestTagEvent first":
          case "You can only issue one request at a time": {
            setTimeout(() => {
              console.log("restart scan");
              scan();
            }, 1000);
            break;
          }
          case "transceive fail":
            prevId.current = "";
            setError(
              new CardMovedError(
                "Card moved while processing, please try again."
              )
            );
            break;
          case "cancelled":
            break;
          default:
            setError(e instanceof Error ? e : new Error(e));
            break;
        }
      }
    };
    listenForEvent();
  }, []);

  useEffect(() => {
    console.log("mount");
    NfcManager.start();
    scan();
    return () => {
      console.log("unmount");
      NfcManager.cancelTechnologyRequest();
      NfcManager.unregisterTagEvent();
    };
  }, [scan]);

  return {
    scannerState,
    resume: () => scan(),
    pause,
    detectedCanId,
    error
  };
};
