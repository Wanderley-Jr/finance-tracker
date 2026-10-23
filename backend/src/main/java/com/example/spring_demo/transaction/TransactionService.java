package com.example.spring_demo.transaction;

import com.example.spring_demo.transaction.dto.TransactionRequest;
import com.example.spring_demo.transaction.dto.TransactionResponse;
import com.example.spring_demo.user.CurrentUserService;
import com.example.spring_demo.user.User;
import com.example.spring_demo.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

class TransactionNotFoundException extends RuntimeException {

    public TransactionNotFoundException(Long id) {
        super("Transaction with id " + id + " not found");
    }
}

@Service
public class TransactionService {
    private final TransactionRepository repository;;
    private final CurrentUserService currentUserService;

    public TransactionService(TransactionRepository repository,
                              UserRepository userRepository, CurrentUserService currentUserService) {
        this.repository = repository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public TransactionResponse create(TransactionRequest request) {
        User user = currentUserService.getCurrentUser();

        Transaction transaction = new Transaction();
        transaction.setAmount(request.amount());
        transaction.setDate(request.date());
        transaction.setTitle(request.title());
        transaction.setDescription(request.description());
        transaction.setUser(user);

        return TransactionResponse.from(repository.save(transaction));
    }

    @Transactional(readOnly = true)
    public Page<Transaction> getTransactions(Specification<Transaction> specification, Pageable pageable) {
        User user = currentUserService.getCurrentUser();

        Specification<Transaction> userSpecification = (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("user").get("id"),
                        user.getId()
                );

        Specification<Transaction> combinedSpecification = specification == null
                ? userSpecification
                : specification.and(userSpecification);

        return repository.findAll(combinedSpecification, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Transaction> findById(Long id) {
        User user = currentUserService.getCurrentUser();
        return repository.findByIdAndUserId(id, user.getId());
    }

    @Transactional
    public TransactionResponse update(Long id, TransactionRequest transaction) {
        User user = currentUserService.getCurrentUser();
        Transaction existing = repository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new TransactionNotFoundException(id));

        existing.setAmount(transaction.amount());
        existing.setTitle(transaction.title());
        existing.setDate(transaction.date());
        existing.setDescription(transaction.description());

        return TransactionResponse.from(repository.save(existing));
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.getCurrentUser();
        repository.deleteByIdAndUserId(id, user.getId());
    }
}
