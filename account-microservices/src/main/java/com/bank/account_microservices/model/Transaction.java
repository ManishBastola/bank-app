package com.bank.account_microservices.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long accountId;
    private Double amount;
    private String accountNumber;


    @Enumerated(EnumType.STRING)
    private TransactionType type;

    private String description;
    private LocalDateTime timestamp;
}
