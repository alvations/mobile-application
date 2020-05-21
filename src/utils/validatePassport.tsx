export const passportBarcodeRegex = /PP-([\w\d]+)(\w)/;

const characters = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "-",
  ".",
  " ",
  "$",
  "/",
  "+",
  "%",
  "*"
];

const mod43checksum = (passport: string): string => {
  let checksum = 0;
  for (let i = 0; i < passport.length; i++) {
    checksum += characters.indexOf(passport[i]);
  }
  checksum = checksum % 43;
  return characters[checksum];
};

export const validate = (passportBarcode: string): boolean => {
  if (!passportBarcodeRegex.exec(passportBarcode)) {
    return false;
  }

  const passportArr = passportBarcode.match(passportBarcodeRegex);
  if (!passportArr || passportArr.length !== 3) {
    return false;
  }

  const passportWithoutChecksum = passportArr[1];
  const checksum = passportArr[2];
  const calculatedChecksum = mod43checksum(passportWithoutChecksum);

  const isValidChecksum = calculatedChecksum === checksum;
  return isValidChecksum;
};

export const validateAndCleanPassport = async (
  passportBarcode: string
): Promise<string> => {
  const isPassportValid = await validate(passportBarcode);
  if (!isPassportValid)
    throw new Error("Error parsing passport number, please try again!");
  const cleanedPassport = passportBarcode
    .match(passportBarcodeRegex)?.[1]
    .toUpperCase();
  if (!cleanedPassport)
    throw new Error("Error parsing passport number, please try again!");
  return cleanedPassport;
};
