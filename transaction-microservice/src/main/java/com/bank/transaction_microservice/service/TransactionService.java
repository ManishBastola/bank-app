package com.bank.transaction_microservice.service;

import com.bank.transaction_microservice.model.Transaction;
import com.bank.transaction_microservice.model.TransactionType;
import com.bank.transaction_microservice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final RestTemplate restTemplate;

    @Value("${account.service.url}")
    private String accountServiceUrl;

    public Transaction processTransaction(Transaction tx) {
        tx.setTimestamp(LocalDateTime.now());

        switch (tx.getType()) {
            case DEPOSIT -> callAccountService(tx.getAccountId(), tx.getAmount(), "add");
            case WITHDRAW, TRANSFER -> callAccountService(tx.getAccountId(), tx.getAmount(), "deduct");
        }

        return transactionRepository.save(tx);
    }

    public List<Transaction> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    private void callAccountService(Long accountId, Double amount, String action) {
        String url = accountServiceUrl + "/accounts/" + action + "/" + accountId + "/" + amount;
        restTemplate.put(url, null);
    }
}
