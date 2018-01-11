const express = require('express');
const router = express.Router();

const names = new Map();


function init() {
  const namesActor = new Map();
  namesActor.set('actor_id', 'ID')
    .set('name', 'Имя')
    .set('lastname', 'Фамилия')
    .set('midlename', 'Отчество')
    .set('experience', 'Опыт')
    .set('rank_id', 'ID звания');


  names.set('actor', namesActor);

}

init();



module.exports = (connect) => {

  router.get('/', (req, res, next) => {
    const tableName = req.query.table;
    connect.then(pool => {
      return pool.request()
        .query(`select * from ${tableName}`);
    }).then(result => {
      names.get(tableName);
      res.render('template', {
        title: tableName,
        header: tableName,
        objectsNames: names.get(tableName).values(),
        objects: result.recordset
      });
      //console.log(result.recordset)
    }).catch(err => {
      console.log('Error', err);
      res.end();
    });
  });

  router.get('/delete', (req, res) => {
    connect.then(pool => {
      return pool.request()
        .query(`delete from ${req.query.table} where actor_id = ${req.query.deleteId}`);
    }).then(result => {
      res.redirect(`/table?table=${req.query.table}`);
    }).catch(err => {
      res.redirect(`/table?table=${req.query.table}`);
    });
  });

  router.get('/update', (req, res) => {
    connect.then(pool => {
      return pool.request()
        .query(`select * from ${req.query.table} where actor_id = ${req.query.updateId}`);
    }).then(result => {
      res.render(`new-line`, {
        table : req.query.table,
        nowLine: result.recordset[0],
        title: 'Обновить запись',
        actionLink: `/table/update/${req.query.updateId}`
      });
    }).catch(err => {
      res.redirect(`/table?table=${req.query.table}`);
    });
  });

  router.get('/update/:id', (req, res) => {
    let updateId = req.params.id;
    console.log('!!!!!!!!!!!!!!!!!!!!!', req.query);
    connect.then(pool => {
      let query = `UPDATE ${req.query.table} SET `;
      for (let key in req.query) {
        if(!(key === 'table')) {
          query += `${key} = \'${req.query[key]}\', `;
        }
      }
      query += `WHERE actor_id = ${updateId}`;

      let newQuery = query.slice(0, query.lastIndexOf(','));
      newQuery += query.slice(query.lastIndexOf(',') + 1);
      console.log('QUERY:', newQuery);
      return pool.request().query(newQuery);
    }).then(result => {
      console.log("EEE");
      res.redirect(`/table?table=${req.query.table}`);
    }).catch(err => {
      console.log(err);
      res.redirect(`/table?table=${req.query.table}`);
    })
  });

  router.get('/new', (req, res) => {
    const keyNamesTable = names.get(req.query.table).keys();
    let objResp = {};
    for (let key of keyNamesTable) {
      objResp[key] = '';
    }
    console.log(objResp);
    res.render(`new-line`, {
      table : req.query.table,
      nowLine: objResp,
      title: 'Новая запись',
      actionLink: `/table/new/create`
    });
  });

  router.get('/new/create', (req, res) => {
    let updateId = req.params.id;
    connect.then(pool => {
      let query = `INSERT INTO ${req.query.table} VALUES (`;
      for (let key in req.query) {
        if(!(key === 'table')) {
          query += `\'${req.query[key]}\', `;
        }
      }
      query += ');';
      let newQuery = query.slice(0, query.lastIndexOf(','));
      newQuery += query.slice(query.lastIndexOf(',') + 1);
      console.log('QUERY:', newQuery);
      return pool.request().query(newQuery);
    }).then(result => {
      res.redirect(`/table?table=${req.query.table}`);
    }).catch(err => {
      res.redirect(`/table?table=${req.query.table}`);
    })
  });




  return router;
};
