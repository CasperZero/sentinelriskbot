// ============================================================================
// DIRECT NON-CUSTODIAL ON-CHAIN PAYMENT VERIFIER (EVM JSON-RPC + BigInt)
// Supports BNB Smart Chain (BEP20), Polygon PoS, and Arbitrum One
// Zero paid explorer API keys or external Web3 dependencies required
// ============================================================================

export type SupportedCryptoNetworkId = "bsc" | "polygon" | "arbitrum";

export interface StablecoinTokenConfig {
  symbol: "USDT" | "USDC";
  label: string;
  contract: string; // lowercase 0x...
  decimals: number;
}

export interface CryptoNetworkConfig {
  id: SupportedCryptoNetworkId;
  label: string;
  shortLabel: string;
  rpcs: string[];
  tokens: StablecoinTokenConfig[];
}

export const ERC20_TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export const EVM_NETWORKS: Record<
  SupportedCryptoNetworkId,
  CryptoNetworkConfig
> = {
  bsc: {
    id: "bsc",
    label: "BNB Smart Chain (BEP20)",
    shortLabel: "BSC (BEP20)",
    rpcs: [
      "https://bsc-dataseed.binance.org",
      "https://bsc-rpc.publicnode.com",
      "https://1rpc.io/bnb",
    ],
    tokens: [
      {
        symbol: "USDT",
        label: "USDT (BEP-20)",
        contract: "0x55d398326f99059fF775485246999027B3197955".toLowerCase(),
        decimals: 18,
      },
      {
        symbol: "USDC",
        label: "USDC (BEP-20)",
        contract: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d".toLowerCase(),
        decimals: 18,
      },
    ],
  },
  polygon: {
    id: "polygon",
    label: "Polygon (PoS)",
    shortLabel: "Polygon",
    rpcs: [
      "https://polygon-bor-rpc.publicnode.com",
      "https://polygon-rpc.com",
      "https://1rpc.io/matic",
    ],
    tokens: [
      {
        symbol: "USDT",
        label: "USDT (Polygon)",
        contract: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F".toLowerCase(),
        decimals: 6,
      },
      {
        symbol: "USDC",
        label: "USDC (Native)",
        contract: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359".toLowerCase(),
        decimals: 6,
      },
      {
        symbol: "USDC",
        label: "USDC.e (Bridged)",
        contract: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174".toLowerCase(),
        decimals: 6,
      },
    ],
  },
  arbitrum: {
    id: "arbitrum",
    label: "Arbitrum One",
    shortLabel: "Arbitrum One",
    rpcs: [
      "https://arb1.arbitrum.io/rpc",
      "https://arbitrum-one-rpc.publicnode.com",
      "https://1rpc.io/arb",
    ],
    tokens: [
      {
        symbol: "USDT",
        label: "USDT (Arbitrum)",
        contract: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9".toLowerCase(),
        decimals: 6,
      },
      {
        symbol: "USDC",
        label: "USDC (Native)",
        contract: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831".toLowerCase(),
        decimals: 6,
      },
      {
        symbol: "USDC",
        label: "USDC.e (Bridged)",
        contract: "0xFF970A61A04b1cA14834A43F5dE4533eBDDB5CC8".toLowerCase(),
        decimals: 6,
      },
    ],
  },
};

export function getConfiguredCryptoWalletAddress(): string {
  const raw = (process.env.CRYPTO_WALLET_ADDRESS || "").trim();
  if (/^0x[a-fA-F0-9]{40}$/.test(raw)) {
    return raw;
  }
  return "";
}

export function getCryptoPaymentEnvConfig() {
  const walletAddress = getConfiguredCryptoWalletAddress();
  const priceUsd = Number(process.env.CRYPTO_PRO_PRICE_USD) || 29;
  const minAcceptUsd = Number(process.env.CRYPTO_MIN_ACCEPT_USD) || 28;
  const maxAgeHours = Number(process.env.CRYPTO_TX_MAX_AGE_HOURS) || 48;

  return {
    enabled: Boolean(walletAddress),
    walletAddress,
    priceUsd,
    minAcceptUsd,
    maxAgeHours,
    networks: (Object.keys(EVM_NETWORKS) as SupportedCryptoNetworkId[]).map(
      (id) => ({
        id,
        label: EVM_NETWORKS[id].label,
        tokens: ["USDT", "USDC"] as const,
      }),
    ),
  };
}

/**
 * Sequential JSON-RPC caller with fallback across public RPC endpoints and ~8s timeout per RPC.
 */
async function callEvmJsonRpc<T = any>(
  networkId: SupportedCryptoNetworkId,
  method: string,
  params: any[],
  timeoutMs: number = 8000,
): Promise<T> {
  const network = EVM_NETWORKS[networkId];
  if (!network) {
    throw new Error(`Unsupported network: ${networkId}`);
  }

  let lastError: Error | null = null;

  for (const rpcUrl of network.rpcs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method,
          params,
        }),
      });
      clearTimeout(timer);

      if (!response.ok) {
        lastError = new Error(`RPC HTTP ${response.status} from ${rpcUrl}`);
        continue;
      }

      const payload: any = await response.json();
      if (payload?.error) {
        lastError = new Error(
          `RPC error from ${rpcUrl}: ${payload.error.message || JSON.stringify(payload.error)}`,
        );
        continue;
      }

      if (payload && "result" in payload) {
        return payload.result as T;
      }

      lastError = new Error(`Malformed JSON-RPC response from ${rpcUrl}`);
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }
  }

  throw (
    lastError ||
    new Error(`All RPC endpoints failed for network ${networkId} (${method})`)
  );
}

export function formatTokenUnitsToUsdString(
  rawAmount: bigint,
  decimals: number,
): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = rawAmount / divisor;
  const fraction = rawAmount % divisor;
  const fractionPadded = fraction
    .toString()
    .padStart(decimals, "0")
    .slice(0, 2)
    .padEnd(2, "0");
  return `${whole.toString()}.${fractionPadded}`;
}

export type OnChainVerificationErrorCode =
  | "invalid_network"
  | "invalid_tx_hash"
  | "wallet_not_configured"
  | "tx_not_found_or_pending"
  | "tx_failed"
  | "tx_pending_confirmations"
  | "tx_too_old"
  | "recipient_or_token_mismatch"
  | "insufficient_amount"
  | "rpc_unreachable";

export interface OnChainVerifySuccess {
  ok: true;
  network: SupportedCryptoNetworkId;
  token: "USDT" | "USDC";
  amount: string;
  amountUsd: number;
  txHash: string;
  blockNumber: number;
  confirmations: number;
}

export interface OnChainVerifyFailure {
  ok: false;
  code: OnChainVerificationErrorCode;
  error: string;
  details?: Record<string, any>;
}

export type OnChainVerifyResult = OnChainVerifySuccess | OnChainVerifyFailure;

export async function verifyOnChainStablecoinPayment(params: {
  network: SupportedCryptoNetworkId;
  txHash: string;
  walletAddress?: string;
  minAcceptUsd?: number;
  maxAgeHours?: number;
}): Promise<OnChainVerifyResult> {
  const envCfg = getCryptoPaymentEnvConfig();
  const targetWallet = (params.walletAddress || envCfg.walletAddress)
    .trim()
    .toLowerCase();
  const minAcceptUsd = params.minAcceptUsd ?? envCfg.minAcceptUsd;
  const maxAgeHours = params.maxAgeHours ?? envCfg.maxAgeHours;

  if (!targetWallet || !/^0x[a-f0-9]{40}$/.test(targetWallet)) {
    return {
      ok: false,
      code: "wallet_not_configured",
      error: "Receiving crypto wallet address is not configured on the server.",
    };
  }

  const networkCfg = EVM_NETWORKS[params.network];
  if (!networkCfg) {
    return {
      ok: false,
      code: "invalid_network",
      error:
        "Invalid network. Supported networks are bsc, polygon, and arbitrum.",
    };
  }

  const normalizedTxHash = String(params.txHash || "")
    .trim()
    .toLowerCase();
  if (!/^0x[a-f0-9]{64}$/.test(normalizedTxHash)) {
    return {
      ok: false,
      code: "invalid_tx_hash",
      error:
        "Invalid transaction hash format. Must be a 66-character 0x hexadecimal hash.",
    };
  }

  try {
    // 1. Fetch transaction receipt
    const receipt = await callEvmJsonRpc<any>(
      params.network,
      "eth_getTransactionReceipt",
      [normalizedTxHash],
    );

    if (!receipt || !receipt.blockNumber) {
      return {
        ok: false,
        code: "tx_not_found_or_pending",
        error:
          "Transaction not found or still pending on this network. Verify the selected network and wait 15 seconds.",
      };
    }

    if (String(receipt.status || "").toLowerCase() !== "0x1") {
      return {
        ok: false,
        code: "tx_failed",
        error: "Transaction reverted or failed on-chain (status !== 0x1).",
      };
    }

    // 2. Check block confirmations (require at least 2 confirmations)
    const latestBlockHex = await callEvmJsonRpc<string>(
      params.network,
      "eth_blockNumber",
      [],
    );
    const latestBlock = BigInt(latestBlockHex);
    const receiptBlock = BigInt(receipt.blockNumber);
    const confirmations =
      latestBlock >= receiptBlock ? Number(latestBlock - receiptBlock) : 0;

    if (latestBlock - receiptBlock < 2n) {
      return {
        ok: false,
        code: "tx_pending_confirmations",
        error: `Transaction is waiting for block confirmations (${confirmations}/2). Please wait 15 seconds and try again.`,
        details: { confirmations, requiredConfirmations: 2 },
      };
    }

    // 3. Check block timestamp age against CRYPTO_TX_MAX_AGE_HOURS
    const blockData = await callEvmJsonRpc<any>(
      params.network,
      "eth_getBlockByNumber",
      [receipt.blockNumber, false],
    );

    if (!blockData || !blockData.timestamp) {
      return {
        ok: false,
        code: "tx_not_found_or_pending",
        error:
          "Unable to read block timestamp from RPC. Please try again in a few seconds.",
      };
    }

    const blockTimestampSec = Number(BigInt(blockData.timestamp));
    const nowSec = Math.floor(Date.now() / 1000);
    const maxAgeSec = maxAgeHours * 3600;

    if (nowSec - blockTimestampSec > maxAgeSec) {
      return {
        ok: false,
        code: "tx_too_old",
        error: `Transaction is older than the maximum allowed window (${maxAgeHours} hours).`,
      };
    }

    // 4. Inspect receipt.logs for whitelisted ERC-20 Transfer events to CRYPTO_WALLET_ADDRESS
    const logs: any[] = Array.isArray(receipt.logs) ? receipt.logs : [];
    const totalsByContract = new Map<
      string,
      { token: StablecoinTokenConfig; totalRaw: bigint }
    >();

    for (const log of logs) {
      const topics: string[] = Array.isArray(log?.topics) ? log.topics : [];
      if (topics.length < 3) continue;

      const topic0 = String(topics[0] || "").toLowerCase();
      if (topic0 !== ERC20_TRANSFER_TOPIC) continue;

      const logContract = String(log?.address || "").toLowerCase();
      const matchedToken = networkCfg.tokens.find(
        (t) => t.contract === logContract,
      );
      if (!matchedToken) continue;

      const rawTopic2 = String(topics[2] || "").toLowerCase();
      if (rawTopic2.length < 40) continue;
      const recipientAddress = "0x" + rawTopic2.slice(-40);
      if (recipientAddress !== targetWallet) continue;

      const rawDataHex = String(log?.data || "0x0").trim();
      if (!rawDataHex || rawDataHex === "0x") continue;

      let transferValue = 0n;
      try {
        transferValue = BigInt(rawDataHex);
      } catch {
        continue;
      }

      if (transferValue <= 0n) continue;

      const existing = totalsByContract.get(matchedToken.contract);
      if (existing) {
        existing.totalRaw += transferValue;
      } else {
        totalsByContract.set(matchedToken.contract, {
          token: matchedToken,
          totalRaw: transferValue,
        });
      }
    }

    if (totalsByContract.size === 0) {
      return {
        ok: false,
        code: "recipient_or_token_mismatch",
        error:
          "No USDT or USDC transfer to the official Sentinel wallet was found in this transaction on the selected network.",
      };
    }

    // 5. Compare summed amount against CRYPTO_MIN_ACCEPT_USD using BigInt scaled math
    const minAcceptCents = BigInt(Math.round(minAcceptUsd * 100));
    let bestInsufficientMatch: {
      token: StablecoinTokenConfig;
      totalRaw: bigint;
    } | null = null;

    for (const entry of totalsByContract.values()) {
      const { token, totalRaw } = entry;
      const minRequiredRaw = minAcceptCents * 10n ** BigInt(token.decimals - 2);

      if (totalRaw >= minRequiredRaw) {
        const formattedAmount = formatTokenUnitsToUsdString(
          totalRaw,
          token.decimals,
        );
        return {
          ok: true,
          network: params.network,
          token: token.symbol,
          amount: formattedAmount,
          amountUsd: Number(formattedAmount),
          txHash: normalizedTxHash,
          blockNumber: Number(receiptBlock),
          confirmations,
        };
      }

      if (!bestInsufficientMatch || totalRaw > bestInsufficientMatch.totalRaw) {
        bestInsufficientMatch = entry;
      }
    }

    const foundStr = bestInsufficientMatch
      ? formatTokenUnitsToUsdString(
          bestInsufficientMatch.totalRaw,
          bestInsufficientMatch.token.decimals,
        )
      : "0.00";
    const foundSymbol = bestInsufficientMatch?.token.symbol || "USDT";

    return {
      ok: false,
      code: "insufficient_amount",
      error: `Transfer amount (${foundStr} ${foundSymbol}) is below the minimum required amount ($${minAcceptUsd} USD).`,
      details: {
        receivedAmount: foundStr,
        token: foundSymbol,
        minRequiredUsd: minAcceptUsd,
      },
    };
  } catch (err: any) {
    console.error(
      `[CryptoVerifier RPC Error on ${params.network}]`,
      err?.message || err,
    );
    return {
      ok: false,
      code: "rpc_unreachable",
      error:
        "Temporary blockchain RPC connection issue. Please wait a few seconds and click Verify Payment again.",
    };
  }
}
