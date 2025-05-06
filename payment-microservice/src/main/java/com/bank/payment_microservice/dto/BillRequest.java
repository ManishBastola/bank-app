package com.bank.payment_microservice.dto;

import com.bank.payment_microservice.model.BillCategory;
import lombok.Data;

@Data
public class BillRequest {
    private Long fromAccountId;
    private BillCategory category;
    private Double amount;
}
