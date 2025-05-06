package com.bank.transaction_microservice.controller;

import com.bank.transaction_microservice.model.Transaction;
import com.bank.transaction_microservice.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/add")
    public Transaction addTransaction(@RequestBody Transaction tx) {
        return transactionService.processTransaction(tx);
    }

    @GetMapping("/user/{userId}")
    public List<Transaction> getUserTransactions(@PathVariable Long userId) {
        return transactionService.getTransactionsByUserId(userId);
    }
}
