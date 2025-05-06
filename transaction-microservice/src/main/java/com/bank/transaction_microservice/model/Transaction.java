package com.bank.transaction_microservice.model;

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

    private Long userId;
    private Long accountId;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    private Double amount;

    private String recipientName;      
    private String recipientAccountNo; 

    private LocalDateTime timestamp;
}
