package com.example.spring_demo.transaction;

import com.example.spring_demo.transaction.dto.TransactionRequest;
import com.example.spring_demo.transaction.dto.TransactionResponse;
import com.example.spring_demo.user.CurrentUserService;
import com.example.spring_demo.user.User;
import com.example.spring_demo.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService service;
    private final TransactionService transactionService;

    public TransactionController(TransactionService service, TransactionService transactionService) {
        this.service = service;
        this.transactionService = transactionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse create(@Valid @RequestBody TransactionRequest request) {
        return transactionService.create(request);
    }

    @GetMapping
    public Page<Transaction> getTransactions(
            Pageable pageable,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description
    ) {
        Specification<Transaction> specification = TransactionSpecs.withFilters(startDate, endDate, title, description);
        return service.getTransactions(specification, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> findById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public TransactionResponse update(@PathVariable Long id, @Valid @RequestBody TransactionRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
