package com.example.spring_demo.transaction;

import com.example.spring_demo.exception.InvalidSortFieldException;
import com.example.spring_demo.exception.TransactionNotFoundException;
import com.example.spring_demo.transaction.dto.TransactionRequest;
import com.example.spring_demo.transaction.dto.TransactionResponse;
import com.example.spring_demo.user.CurrentUserService;
import com.example.spring_demo.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

@Service
public class TransactionService {
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "date",
            "amount",
            "title",
            "description"
    );

    private final TransactionRepository repository;
    private final CurrentUserService currentUserService;

    public TransactionService(TransactionRepository repository, CurrentUserService currentUserService) {
        this.repository = repository;
        this.currentUserService = currentUserService;
    }

    private void validateSort(Pageable pageable) {
        pageable.getSort().forEach(order -> {
            if (!ALLOWED_SORT_FIELDS.contains(order.getProperty())) {
                throw new InvalidSortFieldException(order.getProperty());
            }
        });
    }

    @Transactional
    public TransactionResponse create(TransactionRequest request) {
        User user = currentUserService.getCurrentUser();

        Transaction transaction = new Transaction();
        transaction.setAmount(request.amount());
        transaction.setDate(request.date());
        transaction.setTitle(request.title());
        transaction.setDescription(request.description() != null ? request.description() : "");
        transaction.setUser(user);

        return TransactionResponse.from(repository.save(transaction));
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(Specification<Transaction> specification, Pageable pageable) {
        User user = currentUserService.getCurrentUser();
        validateSort(pageable);

        Specification<Transaction> userSpecification = (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("user").get("id"),
                        user.getId()
                );

        Specification<Transaction> combinedSpecification = specification == null
                ? userSpecification
                : specification.and(userSpecification);

        return repository.findAll(combinedSpecification, pageable).map(TransactionResponse::from);
    }

    @Transactional(readOnly = true)
    public Optional<TransactionResponse> findById(Long id) {
        User user = currentUserService.getCurrentUser();
        return repository.findByIdAndUserId(id, user.getId()).map(TransactionResponse::from);
    }

    @Transactional
    public TransactionResponse update(Long id, TransactionRequest transaction) {
        User user = currentUserService.getCurrentUser();
        Transaction existing = repository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new TransactionNotFoundException(id));

        existing.setAmount(transaction.amount());
        existing.setTitle(transaction.title());
        existing.setDate(transaction.date());
        existing.setDescription(transaction.description() != null ? transaction.description() : "");

        return TransactionResponse.from(repository.save(existing));
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.getCurrentUser();
        repository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new TransactionNotFoundException(id));
        repository.deleteByIdAndUserId(id, user.getId());
    }
}
