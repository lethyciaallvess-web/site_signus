const mysql = require('mysql2/promise');
(async()=>{
 const conn=await mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USERNAME,password:process.env.DB_PASSWORD,database:process.env.DB_DATABASE});
 try {
 const emails=Array.from({length:7},(_,i)=>`cliente${i+2}@exemplo.com`);
 const [rows]=await conn.query(`SELECT u.id, u.email, u.cpf, u.perfil, c.id AS clienteId FROM usuarios u JOIN clientes c ON c.documento=u.cpf AND c.email=u.email WHERE u.email IN (?)`,[emails]);
 if(rows.length!==7) throw new Error('Esperadas sete correspondencias exatas entre usuarios e clientes.');
 const [columns]=await conn.query("SHOW COLUMNS FROM usuarios LIKE 'cliente_id'");
 if(columns.length===0) await conn.query('ALTER TABLE usuarios ADD COLUMN cliente_id BIGINT UNSIGNED NULL, ADD UNIQUE KEY uk_usuarios_cliente (cliente_id), ADD CONSTRAINT fk_usuarios_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON UPDATE CASCADE');
 await conn.query("ALTER TABLE usuarios MODIFY perfil ENUM('ADMIN','OPERADOR','CLIENTE') NOT NULL DEFAULT 'CLIENTE'");
 await conn.beginTransaction();
 for(const row of rows){
  const [result]=await conn.execute("UPDATE usuarios SET perfil='CLIENTE', cliente_id=? WHERE id=? AND email=? AND cpf=? AND (cliente_id IS NULL OR cliente_id=?)",[row.clienteId,row.id,row.email,row.cpf,row.clienteId]);
  if(result.affectedRows!==1) throw new Error('Conta mudou durante a vinculacao: '+row.email);
 }
 await conn.commit();
 console.log(JSON.stringify({clientesVinculados:rows.length,contasPreservadas:true}));
 }catch(e){await conn.rollback();throw e;}finally{await conn.end();}
})().catch(e=>{console.error(e.code||e.message);process.exitCode=1;});
