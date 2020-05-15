import { useState, useCallback, useEffect, useRef } from "react";
import NfcManager, { Ndef, NfcTech } from "react-native-nfc-manager";
type ScannerState =
  | "STARTED"
  | "PAUSED/CARD_DETECTED"
  | "PAUSED/CAN_ID_DETECTED";

export type CepasScannerHook = {
  scannerState: ScannerState;
  resume: () => void;
  detectedCanId: string;
  error?: Error;
};

const getCanId = async (): Promise<string> => {
  NfcManager.transceive([0x00, 0xa4, 0x00, 0x00, 0x02, 0x40, 0x00]);
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

export const useCepasScanner = (): CepasScannerHook => {
  const [scannerState, setScannerState] = useState<ScannerState>("STARTED");
  const [detectedCanId, setDetectedCanId] = useState("");
  const [error, setError] = useState<Error>();

  const timerRef = useRef<any>(); // TODO: type timer properly
  const prevId = useRef("");

  const pause = async (): Promise<void> => {
    // clearTimeout(timerRef.current);

    await NfcManager.cancelTechnologyRequest();
    await NfcManager.unregisterTagEvent();
  };

  const scan = useCallback(() => {
    const listenForEvent = async (): Promise<void> => {
      try {
        // clearTimeout(timerRef.current);
        setDetectedCanId("");
        setError(undefined);
        setScannerState("STARTED");
        await NfcManager.registerTagEvent();
        await NfcManager.requestTechnology(NfcTech.IsoDep);

        setScannerState("PAUSED/CARD_DETECTED");
        const tag = await NfcManager.getTag();
        if (prevId.current !== tag.id) {
          prevId.current = tag.id;
          console.log("discovered", tag);
          const canId = await getCanId();
          console.log(canId);
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
        // timerRef.current = setTimeout(listenForEvent, 0);
      } catch (e) {
        // console.warn("e", e);
        setError(e instanceof Error ? e : new Error(e));
        await pause();
      }
    };
    listenForEvent();
  }, []);

  useEffect(() => {
    console.log("mount");
    NfcManager.start();
    scan();
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => 0);
      NfcManager.unregisterTagEvent().catch(() => 0);
    };
  }, [scan]);

  return {
    scannerState,
    resume: () => scan(),
    detectedCanId,
    error
  };
};
