import { ClienteModelo } from "./cliente-modelo";
import { EventoItemModelo } from "./evento-item-modelo";
import { EventoModelo } from "./evento-modelo";
import { ItemModelo } from "./item-modelo";
import { PlanoItemModelo } from "./plano-item-modelo";
import { PlanoModelo } from "./plano-modelo";
import { UsuarioModelo } from "./usuario-modelo";

ClienteModelo.hasOne(UsuarioModelo, {
  as: "usuario",
  foreignKey: { name: "clienteId", field: "cliente_id", allowNull: true },
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
UsuarioModelo.belongsTo(ClienteModelo, {
  as: "cliente",
  foreignKey: { name: "clienteId", field: "cliente_id", allowNull: true },
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

EventoModelo.belongsTo(ClienteModelo, {
  as: "cliente",
  foreignKey: { name: "clienteId", field: "cliente_id", allowNull: false },
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
ClienteModelo.hasMany(EventoModelo, {
  as: "eventos",
  foreignKey: { name: "clienteId", field: "cliente_id", allowNull: false },
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

EventoModelo.belongsTo(PlanoModelo, {
  as: "plano",
  foreignKey: { name: "planoId", field: "plano_id", allowNull: true },
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
PlanoModelo.hasMany(EventoModelo, {
  as: "eventos",
  foreignKey: { name: "planoId", field: "plano_id", allowNull: true },
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

EventoModelo.belongsTo(UsuarioModelo, {
  as: "criadoPor",
  foreignKey: { name: "criadoPorUsuarioId", field: "criado_por_usuario_id", allowNull: false },
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

PlanoModelo.hasMany(PlanoItemModelo, {
  as: "itens",
  foreignKey: { name: "planoId", field: "plano_id", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
PlanoItemModelo.belongsTo(PlanoModelo, {
  as: "plano",
  foreignKey: { name: "planoId", field: "plano_id", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
PlanoItemModelo.belongsTo(ItemModelo, {
  as: "item",
  foreignKey: { name: "itemId", field: "itens_id", allowNull: true },
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

EventoModelo.hasMany(EventoItemModelo, {
  as: "itensExtras",
  foreignKey: { name: "eventoId", field: "evento_id", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
EventoItemModelo.belongsTo(EventoModelo, {
  as: "evento",
  foreignKey: { name: "eventoId", field: "evento_id", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
EventoItemModelo.belongsTo(ItemModelo, {
  as: "item",
  foreignKey: { name: "itemId", field: "itens_id", allowNull: true },
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

PlanoModelo.belongsToMany(ItemModelo, {
  through: { model: PlanoItemModelo, unique: false },
  as: "itensDoPlano",
  foreignKey: "planoId",
  otherKey: "itemId",
});
EventoModelo.belongsToMany(ItemModelo, {
  through: { model: EventoItemModelo, unique: false },
  as: "itensDoEvento",
  foreignKey: "eventoId",
  otherKey: "itemId",
});

export {
  ClienteModelo,
  EventoItemModelo,
  EventoModelo,
  ItemModelo,
  PlanoItemModelo,
  PlanoModelo,
  UsuarioModelo,
};
