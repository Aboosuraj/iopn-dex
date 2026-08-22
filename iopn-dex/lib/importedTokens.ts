export type ImportedToken = {

  symbol: string;

  name?: string;

  address: string;

  decimals: number;

  native: false;

  imported: true;

};


export const IMPORTED_TOKENS_KEY =
  "iopn-imported-tokens";


const UPDATE_EVENT =
  "iopn-imported-tokens-updated";


function normalizeAddress(
  address: string
) {

  return address.toLowerCase();

}


export function getImportedTokens():
  ImportedToken[] {

  if (
    typeof window ===
    "undefined"
  ) {

    return [];

  }


  try {

    const stored =
      localStorage.getItem(
        IMPORTED_TOKENS_KEY
      );


    if (!stored) {

      return [];

    }


    const parsed =
      JSON.parse(
        stored
      );


    if (
      !Array.isArray(parsed)
    ) {

      return [];

    }


    return parsed.filter(
      (
        token
      ): token is ImportedToken => {

        return (

          token &&

          typeof token ===
            "object" &&

          typeof token.symbol ===
            "string" &&

          typeof token.address ===
            "string" &&

          typeof token.decimals ===
            "number" &&

          token.native ===
            false &&

          token.imported ===
            true

        );

      }
    );

  } catch {

    return [];

  }

}


export function saveImportedToken(
  token: ImportedToken
) {

  if (
    typeof window ===
    "undefined"
  ) {

    return;

  }


  const existing =
    getImportedTokens();


  const normalizedAddress =
    normalizeAddress(
      token.address
    );


  const alreadyExists =
    existing.some(
      item =>
        normalizeAddress(
          item.address
        ) ===
        normalizedAddress
    );


  if (
    alreadyExists
  ) {

    return;

  }


  const normalizedToken:
    ImportedToken = {

    symbol:
      token.symbol,

    name:
      token.name ||
      token.symbol,

    address:
      token.address,

    decimals:
      Number(
        token.decimals
      ),

    native:
      false,

    imported:
      true,

  };


  localStorage.setItem(

    IMPORTED_TOKENS_KEY,

    JSON.stringify([
      ...existing,
      normalizedToken,
    ])

  );


  window.dispatchEvent(
    new Event(
      UPDATE_EVENT
    )
  );

}