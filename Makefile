frontend:
	cd frontend && npm run dev

backend:
	docker-compose up -d

startdev:
	make backend
	make frontend

stopdev:
	docker-compose down

.PHONY: frontend backend startdev stopdev