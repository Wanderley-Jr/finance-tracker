package com.example.spring_demo.transaction;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    @GetMapping
    public List<Transaction> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Transaction> findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Transaction create(@Valid @RequestBody Transaction transaction) {
        return service.create(transaction);
    }

    @PutMapping
    public Transaction update(@PathVariable Long id, @Valid @RequestBody Transaction transaction) {
        return service.update(id, transaction);
    }

    @DeleteMapping
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
