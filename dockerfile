FROM oven/bun:1.1-alpine

WORKDIR /app

# Copia manifiestos primero
COPY package.json ./
RUN bun install

# Copia el resto
COPY . .

EXPOSE 5173

# Arranca Vite via script dev
CMD ["bun", "run", "dev"]
