FROM oven/bun:alpine AS web
WORKDIR /web

COPY web/ /web/

RUN bun i
RUN bun run build

FROM rust:alpine AS build
WORKDIR /build

COPY src src
COPY Cargo.* .

RUN cargo build --release

FROM alpine:latest
WORKDIR /app

COPY --from=web /dist /app/dist
COPY --from=build /build/target/release/neon-dawn .

EXPOSE 80
ENTRYPOINT [ "/app/neon-dawn" ]