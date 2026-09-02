INSERT INTO usuarios (nombre_completo, registro_medico, especialidad, usuario, password_hash, es_admin)
VALUES ('Juan Perez', 'RM-111111', 'MEDICINA FISICA Y REHABILITACION', 'jperez', '$2b$12$8eQ0h0z7n3wGCEtiNVDFN.UqAPpMA8K7qmCGElBou3bDrWXfdVWsm', FALSE);

INSERT INTO usuarios (nombre_completo, registro_medico, especialidad, usuario, password_hash, es_admin)
VALUES ('Laura Morales', 'RM-222222', 'MEDICINA FISICA Y REHABILITACION', 'lmorales', '$2b$12$lo8ztLLTe2OVJ7smp03iPevDZ/w6Qdd1fpvtMmrdNiT7qfoJG535u', FALSE);

INSERT INTO usuarios (nombre_completo, registro_medico, especialidad, usuario, password_hash, es_admin)
VALUES ('Carlos Ramirez', 'RM-333333', 'MEDICINA FISICA Y REHABILITACION', 'cramirez', '$2b$12$.C7Z71N0XN4Awe6ZcEnIQO3ymuLsQo/p0WGSd66yGQ8mDz3Y7cOBq', FALSE);

-- Verificacion
SELECT id, nombre_completo, usuario FROM usuarios ORDER BY id;
