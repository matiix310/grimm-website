"use client";

import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./Pagination";

type FullPaginationProps = {
  totalPages: number;
  onPageChange?: (pageIndex: number) => unknown;
  selectedPage: number;
} & React.ComponentProps<typeof Pagination>;

const FullPagination = ({
  totalPages,
  onPageChange = () => {},
  selectedPage,
  className,
  ...rest
}: FullPaginationProps) => {
  return (
    <Pagination className={cn("w-fit mx-0", className)} {...rest}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            content="Précedent"
            onClick={() => onPageChange(Math.max(0, selectedPage - 1))}
          />
        </PaginationItem>
        {totalPages > 4 ? (
          <>
            {selectedPage > 1 && (
              <>
                <PaginationItem>
                  <PaginationLink onClick={() => onPageChange(0)}>1</PaginationLink>
                </PaginationItem>

                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              </>
            )}

            {selectedPage > 0 && (
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(selectedPage - 1)}>
                  {selectedPage}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationLink isActive>{selectedPage + 1}</PaginationLink>
            </PaginationItem>

            {selectedPage + 1 < totalPages && (
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(selectedPage + 1)}>
                  {selectedPage + 2}
                </PaginationLink>
              </PaginationItem>
            )}

            {selectedPage < totalPages - 2 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>

                <PaginationItem>
                  <PaginationLink onClick={() => onPageChange(totalPages - 1)}>
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
          </>
        ) : (
          [...Array(totalPages).keys()].map((i) => (
            <PaginationItem key={i}>
              <PaginationLink isActive={selectedPage === i}>{i + 1}</PaginationLink>
            </PaginationItem>
          ))
        )}
        <PaginationItem>
          <PaginationNext
            content="Suivant"
            onClick={() =>
              onPageChange(Math.min(Math.max(totalPages - 1, 0), selectedPage + 1))
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export { FullPagination };
