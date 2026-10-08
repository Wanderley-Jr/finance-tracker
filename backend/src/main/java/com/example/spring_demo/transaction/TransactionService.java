package com.example.spring_demo.transaction;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

class TransactionNotFoundException extends RuntimeException {

    public TransactionNotFoundException(Long id) {
        super("Transaction with id " + id + " not found");
    }
}

@Service
public class TransactionService {
    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    public Transaction create(Transaction transaction) {
        return repository.save(transaction);
    }

    public List<Transaction> findAll() {
        return repository.findAllByOrderByDateDesc();
    }

    public Optional<Transaction> findById(Long id) {
        return repository.findById(id);
    }

    public Transaction update(Long id, Transaction transaction) {
        Transaction existing = repository.findById(id)
                .orElseThrow(() -> new TransactionNotFoundException(id));

        existing.setAmount(transaction.getAmount());
        existing.setDate(transaction.getDate());
        existing.setDescription(transaction.getDescription());

        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
