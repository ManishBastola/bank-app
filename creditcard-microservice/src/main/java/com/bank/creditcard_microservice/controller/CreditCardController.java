package com.bank.creditcard_microservice.controller;

import com.bank.creditcard_microservice.model.CreditCard;
import com.bank.creditcard_microservice.service.CreditCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/credit-cards")
@RequiredArgsConstructor
public class CreditCardController {

    private final CreditCardService service;

    @PostMapping
    public ResponseEntity<CreditCard> create(@RequestBody CreditCard card) {
        return ResponseEntity.ok(service.createCard(card));
    }

    @GetMapping
    public ResponseEntity<List<CreditCard>> getAll() {
        return ResponseEntity.ok(service.getAllCards());
    }
}