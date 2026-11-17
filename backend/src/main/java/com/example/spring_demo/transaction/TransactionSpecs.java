package com.example.spring_demo.transaction;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.query.EscapeCharacter;

import java.time.LocalDate;
import java.util.Locale;

public final class TransactionSpecs {
    private TransactionSpecs() {}

    public static Specification<Transaction> withFilters(
            LocalDate startDate,
            LocalDate endDate,
            String titleQuery,
            String descriptionQuery,
            String searchQuery
    ) {
        String title = EscapeCharacter.DEFAULT.escape(titleQuery);
        String description = EscapeCharacter.DEFAULT.escape(descriptionQuery);
        String search = EscapeCharacter.DEFAULT.escape(searchQuery);

        Specification<Transaction> specification =
                (root, query, criteriaBuilder) ->
                        criteriaBuilder.conjunction();

        if (startDate != null) {
            specification = specification.and((root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(root.get("date"), startDate)
            );
        }

        if (endDate != null) {
            specification = specification.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.lessThanOrEqualTo(root.get("date"), endDate)
            );
        }

        if (title != null && !title.isBlank()) {
            specification = specification.and((root, query, criteriaBuilder) ->
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")),
                        "%" + title.toLowerCase(Locale.ROOT) + "%",
                        EscapeCharacter.DEFAULT.getEscapeCharacter()
                )
            );
        }

        if (description != null && !description.isBlank()) {
            specification = specification.and((root, query, criteriaBuilder) ->
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")),
                        "%" + description.toLowerCase(Locale.ROOT) + "%",
                        EscapeCharacter.DEFAULT.getEscapeCharacter()
                )
            );
        }

        // A general search matches either field, unlike the field-specific
        // title/description filters above, which are combined with AND.
        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.toLowerCase(Locale.ROOT) + "%";

            specification = specification.and((root, query, criteriaBuilder) ->
                criteriaBuilder.or(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("title")),
                                pattern,
                                EscapeCharacter.DEFAULT.getEscapeCharacter()
                        ),
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("description")),
                                pattern,
                                EscapeCharacter.DEFAULT.getEscapeCharacter()
                        )
                )
            );
        }

        return specification;
    }
}
