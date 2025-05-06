package com.bank.account_microservices.controller;

import com.bank.account_microservices.model.Account;
import com.bank.account_microservices.service.AccountService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/account")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping("/create")
    public Account create(HttpServletRequest request, @RequestBody Account account) {
        Long userId = (Long) request.getAttribute("userId");
        account.setUserId(userId); // set userId in entity
        return accountService.createAccount(account);
    }

    @GetMapping("/my")
    public List<Account> getMyAccounts(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return accountService.getAccountsByUserId(userId);
    }

    @GetMapping("/{id}")
    public Account getById(@PathVariable Long id) {
        return accountService.getAccountById(id).orElse(null);
    }

    @GetMapping("/{id}/balance")
    public Double getBalance(@PathVariable Long id) {
        return accountService.getBalance(id);
    }
    
    @PutMapping("/{id}/deduct")
    public boolean deductAmount(@PathVariable Long id, @RequestParam double amount) {
        return accountService.deductBalance(id, amount);
    }
    @PostMapping("/deduct/{accountId}/{amount}")
    public ResponseEntity<String> deductBalance(@PathVariable Long accountId, @PathVariable Double amount) {
        accountService.deductBalance(accountId, amount);
        return ResponseEntity.ok("Balance deducted");
    }


}
