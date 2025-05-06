package com.bank.creditcard_microservice.service;

import com.bank.creditcard_microservice.model.CreditCard;
import com.bank.creditcard_microservice.repository.CreditCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CreditCardService {

    private final CreditCardRepository repository;

    public CreditCard createCard(CreditCard card) {
        return repository.save(card);
    }

    public List<CreditCard> getAllCards() {
        return repository.findAll();
    }
}