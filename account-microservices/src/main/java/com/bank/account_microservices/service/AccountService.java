package com.bank.account_microservices.service;

import com.bank.account_microservices.model.Account;
import com.bank.account_microservices.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    public Account createAccount(Account account) {
        account.setAccountNumber(UUID.randomUUID().toString());
        if (account.getBalance() == null) account.setBalance(0.0);
        return accountRepository.save(account);
    }
    
    public boolean deductBalance(Long accountId, double amount) {
        Optional<Account> optional = accountRepository.findById(accountId);
        if (optional.isEmpty()) return false;

        Account account = optional.get();
        if (account.getBalance() < amount) return false;

        account.setBalance(account.getBalance() - amount);
        accountRepository.save(account);
        return true;
    }


    public List<Account> getAccountsByUserId(Long userId) {
        return accountRepository.findByUserId(userId);
    }

    public Optional<Account> getAccountById(Long id) {
        return accountRepository.findById(id);
    }

    public Double getBalance(Long id) {
        return accountRepository.findById(id).map(Account::getBalance).orElse(null);
    }
}
