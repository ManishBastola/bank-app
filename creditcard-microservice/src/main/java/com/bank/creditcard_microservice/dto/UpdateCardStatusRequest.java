package com.bank.creditcard_microservice.dto;

import com.bank.creditcard_microservice.model.CreditCardStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCardStatusRequest {
    private CreditCardStatus status;
    private Double approvedLimit; // only used if status == APPROVED
}
