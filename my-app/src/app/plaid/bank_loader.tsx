// lib/loadUserAccounts.ts
import api from "@/utils/api";
import type { Balance, PlaidAccountSummary } from "@/types/types";

export type CompiledBalance = {
  bankName: string;
  accountType: string;
  balance: number;
  dateCreated: string;
};

export async function loadUserAccounts(
  token: string,
  setAccounts: (data: CompiledBalance[]) => void,
  setInstitutions: (data: Record<string, string>) => void,
  setError: (msg: string | null) => void,
  institutions: Record<string, string>
) {
  try {
    const { data: balances } = await api.get<Balance[]>("/plaid/balances/all", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { data: accountData } = await api.get<PlaidAccountSummary[]>("/plaid/accounts/all", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const uniqueInstitutionIds = Array.from(
      new Set(
        accountData
          .map((a) => a.institution_id)
          .filter((id): id is string => !!id && !institutions[id])
      )
    );

    const newInstitutions: Record<string, string> = {};
    await Promise.all(
      uniqueInstitutionIds.map(async (id) => {
        try {
          const { data } = await api.get<{ name: string }>(`/plaid/institution/info?institution_id=${id}`);
          newInstitutions[id] = data.name;
        } catch {
          newInstitutions[id] = id;
        }
      })
    );

    setInstitutions({ ...institutions, ...newInstitutions });


    const compiledBalanceList: CompiledBalance[] = balances.map((balance) => {
      const matchingAccount = accountData.find((a) => a.item_id === balance.item_id);
      const bankName = matchingAccount?.institution_id
        ? institutions[matchingAccount.institution_id] || newInstitutions[matchingAccount.institution_id] || "Unknown"
        : "Unknown";

      return {
        bankName,
        accountType: balance.subtype || "Unknown",
        balance: balance.current ?? 0,
        dateCreated: new Date(balance.last_updated).toLocaleString(),
      };
    });

    setAccounts(compiledBalanceList);
  } catch (err: any) {
    setError(err.response?.data?.detail || err.message);
  }
}
