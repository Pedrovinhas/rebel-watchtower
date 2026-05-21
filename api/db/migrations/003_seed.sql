DO $$
BEGIN

INSERT INTO entities (name, status) VALUES
  ('Millennium Falcon',          'active'),
  ('Death Star',                 'active'),
  ('X-Wing Red Five',            'active'),
  ('Executor',                   'active'),
  ('Tantive IV',                 'suspended'),
  ('Echo Base Shield Generator', 'suspended'),
  ('AT-AT Walker Blizzard 1',    'active'),
  ('TIE Fighter Alpha Squadron', 'active'),
  ('Holographic Comm Network',   'active'),
  ('Tatooine Moisture Farm Network',   'active'),
  ('Coruscant Senate Comms Hub',       'active'),
  ('Hoth Perimeter Sensor Array',      'suspended'),
  ('Naboo Royal Palace Systems',       'active'),
  ('Mustafar Mining Operations',       'suspended'),
  ('Dagobah Swamp Relay Station',      'active')
ON CONFLICT (name) DO NOTHING;

INSERT INTO events (entity_id, external_id, type, payload, created_at)
SELECT e.id, v.external_id, v.type, v.payload::jsonb, v.ts
FROM (VALUES
  ('Millennium Falcon', 'seed-mf-001', 'info',     '{"message": "Navicomputer calibrado com sucesso"}',                   NOW() - INTERVAL '6 days'),
  ('Millennium Falcon', 'seed-mf-002', 'warning',  '{"component": "hyperdrive", "status": "degraded", "output": "0.5x"}', NOW() - INTERVAL '4 days'),
  ('Millennium Falcon', 'seed-mf-003', 'critical', '{"reason": "Falha no hiperdrive — Kessel Run abortado"}',             NOW() - INTERVAL '2 days'),
  ('Millennium Falcon', 'seed-mf-004', 'info',     '{"message": "Hiperdrive reparado por Chewbacca"}',                    NOW() - INTERVAL '1 day'),
  ('Millennium Falcon', 'seed-mf-005', 'warning',  '{"sensor": "deflector_shield", "integrity": "61%"}',                  NOW() - INTERVAL '3 hours'),

  ('Death Star', 'seed-ds-001', 'info',     '{"message": "Superlaser carregado — 100%"}',                                NOW() - INTERVAL '7 days'),
  ('Death Star', 'seed-ds-002', 'critical', '{"reason": "Ventilação de escape detectada no setor 7-G"}',                 NOW() - INTERVAL '6 days'),
  ('Death Star', 'seed-ds-003', 'critical', '{"reason": "Falha na blindagem do reator principal"}',                      NOW() - INTERVAL '5 days'),
  ('Death Star', 'seed-ds-004', 'warning',  '{"zone": "hangar_bay", "alert": "X-Wings detectados"}',                    NOW() - INTERVAL '3 days'),
  ('Death Star', 'seed-ds-005', 'critical', '{"reason": "Interceptação de sinal rebelde no canal 5"}',                   NOW() - INTERVAL '2 days'),
  ('Death Star', 'seed-ds-006', 'critical', '{"reason": "Brecha na segurança — tiro de torpedo prótons confirmado"}',    NOW() - INTERVAL '12 hours'),

  ('X-Wing Red Five', 'seed-xw-001', 'info',    '{"message": "Luke Skywalker embarcado — missão: Death Star"}',          NOW() - INTERVAL '5 days'),
  ('X-Wing Red Five', 'seed-xw-002', 'info',    '{"message": "Artoo-Detoo instalado no slot de astromech"}',             NOW() - INTERVAL '5 days'),
  ('X-Wing Red Five', 'seed-xw-003', 'warning', '{"system": "s-foils", "status": "travados em posição de ataque"}',     NOW() - INTERVAL '3 days'),
  ('X-Wing Red Five', 'seed-xw-004', 'info',    '{"message": "Torpedos de prótons disparados — alvo eliminado"}',        NOW() - INTERVAL '2 days'),

  ('Executor', 'seed-ex-001', 'info',     '{"message": "Frota Imperial em formação — Setor Hoth"}',                     NOW() - INTERVAL '6 days'),
  ('Executor', 'seed-ex-002', 'warning',  '{"officer": "Admiral Ozzel", "reason": "saiu do hiperespaço muito perto"}',  NOW() - INTERVAL '5 days'),
  ('Executor', 'seed-ex-003', 'critical', '{"reason": "Ozzel morto por Vader — Piett promovido a Almirante"}',          NOW() - INTERVAL '5 days'),
  ('Executor', 'seed-ex-004', 'warning',  '{"shields": "bridge_deflector", "integrity": "72%"}',                        NOW() - INTERVAL '2 days'),
  ('Executor', 'seed-ex-005', 'critical', '{"reason": "Ponte exposta após falha do escudo — colisão iminente"}',        NOW() - INTERVAL '6 hours'),

  ('Tantive IV', 'seed-tv-001', 'info',     '{"message": "Planos da Estrela da Morte a bordo"}',                        NOW() - INTERVAL '10 days'),
  ('Tantive IV', 'seed-tv-002', 'warning',  '{"pursuer": "Star Destroyer", "distance_km": 500}',                       NOW() - INTERVAL '9 days'),
  ('Tantive IV', 'seed-tv-003', 'critical', '{"reason": "Casco comprometido — soldados imperiais a bordo"}',            NOW() - INTERVAL '9 days'),
  ('Tantive IV', 'seed-tv-004', 'critical', '{"reason": "Capturada por Darth Vader — tripulação presa"}',               NOW() - INTERVAL '9 days'),

  ('Echo Base Shield Generator', 'seed-eb-001', 'info',     '{"message": "Gerador de escudo planetário online"}',        NOW() - INTERVAL '8 days'),
  ('Echo Base Shield Generator', 'seed-eb-002', 'warning',  '{"temperature": -60, "unit": "celsius", "risk": "freeze"}', NOW() - INTERVAL '5 days'),
  ('Echo Base Shield Generator', 'seed-eb-003', 'critical', '{"reason": "AT-AT destruiu o gerador — escudo caiu"}',      NOW() - INTERVAL '3 days'),
  ('Echo Base Shield Generator', 'seed-eb-004', 'critical', '{"reason": "Base comprometida — evacuação iniciada"}',      NOW() - INTERVAL '3 days'),

  ('AT-AT Walker Blizzard 1', 'seed-at-001', 'info',    '{"message": "Caminhando em direção a Echo Base"}',              NOW() - INTERVAL '4 days'),
  ('AT-AT Walker Blizzard 1', 'seed-at-002', 'info',    '{"message": "Canhão principal carregado"}',                     NOW() - INTERVAL '4 days'),
  ('AT-AT Walker Blizzard 1', 'seed-at-003', 'warning', '{"threat": "snowspeeder", "tow_cables": "detected"}',           NOW() - INTERVAL '3 days'),
  ('AT-AT Walker Blizzard 1', 'seed-at-004', 'warning', '{"legs": "envoltas em cabo de reboque", "stability": "low"}',  NOW() - INTERVAL '3 days'),

  ('TIE Fighter Alpha Squadron', 'seed-tf-001', 'info', '{"message": "10 caças em patrulha — setor Yavin IV"}',          NOW() - INTERVAL '7 days'),
  ('TIE Fighter Alpha Squadron', 'seed-tf-002', 'info', '{"message": "Formação de ataque sobre X-Wings rebeldes"}',      NOW() - INTERVAL '6 days'),
  ('TIE Fighter Alpha Squadron', 'seed-tf-003', 'info', '{"message": "3 caças abatidos — reagrupamento em curso"}',      NOW() - INTERVAL '5 days'),

  ('Holographic Comm Network', 'seed-hc-001', 'info', '{"message": "Rede HoloNet sincronizada — 128 nós ativos"}',       NOW() - INTERVAL '6 days'),
  ('Holographic Comm Network', 'seed-hc-002', 'info', '{"message": "Mensagem de Leia Organa interceptada e cifrada"}',   NOW() - INTERVAL '3 days'),
  ('Holographic Comm Network', 'seed-hc-003', 'info', '{"message": "Canal seguro para Mon Mothma estabelecido"}',        NOW() - INTERVAL '1 day'),

  ('Tatooine Moisture Farm Network', 'seed-ta-001', 'info',     '{"message": "Coletores de umidade online — 247 unidades ativas"}',    NOW() - INTERVAL '7 days'),
  ('Tatooine Moisture Farm Network', 'seed-ta-002', 'warning',  '{"sensor": "unit_73", "moisture_level": "3%", "threshold": "8%"}',    NOW() - INTERVAL '5 days'),
  ('Tatooine Moisture Farm Network', 'seed-ta-003', 'warning',  '{"threat": "Tusken Raiders", "sector": "Jundland Wastes"}',           NOW() - INTERVAL '3 days'),
  ('Tatooine Moisture Farm Network', 'seed-ta-004', 'critical', '{"reason": "Unidade central destruída — Jawas suspeitos"}',           NOW() - INTERVAL '1 day'),

  ('Coruscant Senate Comms Hub', 'seed-co-001', 'info',    '{"message": "1.024 canais senatoriais sincronizados"}',                   NOW() - INTERVAL '6 days'),
  ('Coruscant Senate Comms Hub', 'seed-co-002', 'info',    '{"message": "Sessão do Senado Galático transmitida com sucesso"}',        NOW() - INTERVAL '4 days'),
  ('Coruscant Senate Comms Hub', 'seed-co-003', 'warning', '{"anomaly": "sinal_criptografado", "origem": "desconhecida"}',            NOW() - INTERVAL '2 days'),
  ('Coruscant Senate Comms Hub', 'seed-co-004', 'info',    '{"message": "Segurança reforçada após alerta de infiltração Sith"}',      NOW() - INTERVAL '12 hours'),

  ('Hoth Perimeter Sensor Array', 'seed-ho-001', 'info',     '{"message": "104 sensores de perímetro calibrados — temperatura -57°C"}', NOW() - INTERVAL '9 days'),
  ('Hoth Perimeter Sensor Array', 'seed-ho-002', 'warning',  '{"probe_droid": "Imperial Viper", "distance_km": 800}',                  NOW() - INTERVAL '7 days'),
  ('Hoth Perimeter Sensor Array', 'seed-ho-003', 'critical', '{"reason": "Sonda imperial detectou a base — posição comprometida"}',    NOW() - INTERVAL '6 days'),
  ('Hoth Perimeter Sensor Array', 'seed-ho-004', 'critical', '{"reason": "Frota imperial em órbita — ataque iminente"}',              NOW() - INTERVAL '5 days'),

  ('Naboo Royal Palace Systems', 'seed-na-001', 'info',    '{"message": "Sistemas de palácio nominais — Rainha Amidala a bordo"}',    NOW() - INTERVAL '5 days'),
  ('Naboo Royal Palace Systems', 'seed-na-002', 'warning', '{"blockade": "Trade Federation", "ships": 32}',                           NOW() - INTERVAL '4 days'),
  ('Naboo Royal Palace Systems', 'seed-na-003', 'info',    '{"message": "Guarda Gungan posicionada no perímetro sul"}',               NOW() - INTERVAL '2 days'),

  ('Mustafar Mining Operations', 'seed-mu-001', 'info',     '{"message": "Extração de lava em capacidade máxima — 98% eficiência"}',  NOW() - INTERVAL '8 days'),
  ('Mustafar Mining Operations', 'seed-mu-002', 'warning',  '{"temperature": 4200, "unit": "celsius", "reactor_stress": "high"}',    NOW() - INTERVAL '6 days'),
  ('Mustafar Mining Operations', 'seed-mu-003', 'critical', '{"reason": "Duto de lava rompido — nível 3 evacuado"}',                  NOW() - INTERVAL '4 days'),
  ('Mustafar Mining Operations', 'seed-mu-004', 'critical', '{"reason": "Batalha detectada nas instalações — danos estruturais graves"}', NOW() - INTERVAL '2 days'),
  ('Mustafar Mining Operations', 'seed-mu-005', 'critical', '{"reason": "Plataformas 7 e 8 destruídas — supervisor morto"}',          NOW() - INTERVAL '1 day'),

  ('Dagobah Swamp Relay Station', 'seed-da-001', 'info',    '{"message": "Relay operacional — atmosfera densa, sinal estável"}',      NOW() - INTERVAL '10 days'),
  ('Dagobah Swamp Relay Station', 'seed-da-002', 'info',    '{"message": "Interferência incomum na Força detectada — sem anomalia técnica"}', NOW() - INTERVAL '7 days'),
  ('Dagobah Swamp Relay Station', 'seed-da-003', 'warning', '{"swamp_gas": "elevated", "sensor_drift": "4.2%"}',                     NOW() - INTERVAL '3 days')

) AS v(entity_name, external_id, type, payload, ts)
JOIN entities e ON e.name = v.entity_name
ON CONFLICT (external_id) DO NOTHING;

UPDATE entities e
SET
  total_events_count    = counts.total,
  critical_events_count = counts.critical,
  last_event_at         = counts.last_at,
  updated_at            = NOW()
FROM (
  SELECT
    entity_id,
    COUNT(*)                               AS total,
    COUNT(*) FILTER (WHERE type = 'critical') AS critical,
    MAX(created_at)                        AS last_at
  FROM events
  GROUP BY entity_id
) counts
WHERE e.id = counts.entity_id;

END $$;
