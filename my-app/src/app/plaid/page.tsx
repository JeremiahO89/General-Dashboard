"use client";
import React, { useState, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import api from "@/utils/api"; // Adjust if needed

type CreateLinkTokenResponse = {
  link_token: string;
};

type ExchangePublicTokenResponse = {
  access_token: string;
};

export default function PlaidLinkComponent() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .post<CreateLinkTokenResponse>("/plaid/create_link_token")
      .then((res) => {
        setLinkToken(res.data.link_token);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || err.message);
      });
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken ?? "",
    onSuccess: (public_token: string) => {
      api
        .post<ExchangePublicTokenResponse>("/plaid/exchange_public_token", {
          public_token,
        })
        .then((res) => {
          setAccessToken(res.data.access_token);
          setError(null);

          // Fetch transactions after exchanging token
          return api.get("/plaid/transactions", {
            params: {
              access_token: res.data.access_token,
              start_date: new Date("2024-01-01").toISOString().split("T")[0],
              end_date: new Date().toISOString().split("T")[0],
            },
          });
        })
        .then((res) => {
          setTransactions(res.data.transactions);
        })
        .catch((err) => {
          setError(err.response?.data?.detail || err.message);
        });
    },
    onExit: (err) => {
      if (err) {
        setError(
          `Plaid exited with error: ${err.display_message || err.error_message}`
        );
      }
    },
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>Plaid Link Test</h2>

      {!linkToken && !error && <p>Loading link token...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <button onClick={() => open()} disabled={!ready || !linkToken}>
        Connect a Bank Account
      </button>

      {accessToken && (
        <div style={{ marginTop: 20 }}>
          <h4>Access Token (store securely):</h4>
          <code>{accessToken}</code>
        </div>
      )}

      {transactions && (
        <div style={{ marginTop: 20 }}>
          <h4>Transactions:</h4>
          <ul>
            {transactions.map((tx: any) => (
              <li key={tx.transaction_id}>
                {tx.date}: {tx.name} - ${tx.amount}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
