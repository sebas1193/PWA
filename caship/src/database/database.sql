-- Usuarios
CREATE TABLE usuarios (
  id            UUID PRIMARY KEY,
  nombres       VARCHAR,
  apellidos     VARCHAR,
  email         VARCHAR UNIQUE NOT NULL,
  passwd_hash   VARCHAR NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Monedas
CREATE TABLE monedas (
  id            UUID PRIMARY KEY,
  codigo        CHAR(3) UNIQUE NOT NULL,
  nombre        VARCHAR NOT NULL,
  simbolo       VARCHAR(5) NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE
);

-- Categorías
CREATE TABLE categorias (
  id            UUID PRIMARY KEY,
  nombre        VARCHAR UNIQUE NOT NULL,
  icono         VARCHAR
);

-- Cuentas
CREATE TABLE cuentas (
  id            UUID PRIMARY KEY,
  id_usuario    UUID REFERENCES usuarios(id),
  id_moneda     UUID REFERENCES monedas(id),
  nombre        VARCHAR NOT NULL,
  saldo         DECIMAL(15,2) DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Transacciones
CREATE TABLE transacciones (
  id            UUID PRIMARY KEY,
  id_cuenta     UUID REFERENCES cuentas(id),
  id_categoria  UUID REFERENCES categorias(id),
  naturaleza    VARCHAR CHECK (naturaleza IN ('ingreso', 'egreso')),
  monto         DECIMAL(15,2) NOT NULL,
  descripcion   TEXT,
  fecha         DATE NOT NULL,
  latitud       DECIMAL(9,6),
  longitud      DECIMAL(9,6),
  url_imagen    VARCHAR,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Seed monedas más comunes
INSERT INTO monedas (id, codigo, nombre, simbolo) VALUES
  (gen_random_uuid(), 'COP', 'Peso colombiano',  '$'),
  (gen_random_uuid(), 'USD', 'Dólar americano',  '$'),
  (gen_random_uuid(), 'EUR', 'Euro',             '€'),
  (gen_random_uuid(), 'GBP', 'Libra esterlina',  '£'),
  (gen_random_uuid(), 'MXN', 'Peso mexicano',    '$'),
  (gen_random_uuid(), 'BRL', 'Real brasileño',   'R$');