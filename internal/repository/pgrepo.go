package repository

import (
	"context"
	"sync"
)

import "github.com/jackc/pgx/v4/pgxpool"

type PGRepo struct {
	mu   *sync.Mutex
	pool *pgxpool.Pool
}

func NewPGRepo(addrStr string) (*PGRepo, error) {
	pool, err := pgxpool.Connect(context.Background(), addrStr)
	if err != nil {
		return nil, err
	}
	return &PGRepo{mu: &sync.Mutex{}, pool: pool}, nil
}
