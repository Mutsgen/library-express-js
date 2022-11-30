import express, { json } from "express";
import { database } from "./database/index.js";
import { createConnection } from "mariadb";

const app = express();

app.use(
  json({
    type: ["application/json", "text/plain"],
  })
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,PATCH,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  next();
});

app.get("/:table", async (req, res) => {
  const tables = await database.connection.query("SHOW TABLES;");

  const tablesValue = tables.map((tables) => {
    return tables.Tables_in_librarypopkov;
  });
  if (!tablesValue.includes(req.params.table)) return res.sendStatus(404);
  const request = await database.connection.query(
    `SELECT * FROM ${req.params.table};`
  );

  res.send(request);
});

app.get("/everybook/get", async (req, res) => {
  const booktypes = await database.connection.query("select * from booktype");
  async function dataGetterToBook(book) {
    const authorObj = await database.connection.query(
      `SELECT AUTHOR_NAME FROM AUTHOR WHERE ${book.author} = AUTHOR_ID;`
    );
    const ganreObj = await database.connection.query(
      `SELECT GANRE_NAME FROM GANRE WHERE ${book.ganre} = GANRE_ID`
    );
    const count = await database.connection.query(
      `SELECT COUNT(book_id) as count from STORE where booktype = ${book.booktype_id} and havely = 1`
    );
    return {
      authorName: authorObj[0].AUTHOR_NAME,
      ganreName: ganreObj[0].GANRE_NAME,
      count: count[0].count,
    };
  }
  const correctBooks = [];
  for (let i = 0; i < booktypes.length; i++) {
    const element = booktypes[i];
    const newElement = { ...element, ...(await dataGetterToBook(element)) };
    correctBooks.push(newElement);
  }

  res.send(correctBooks);
});

app.get("/user/:user", async (req, res) => {
  const user = req.params.user !== undefined ? req.params.user : null;

  async function getTypeFromBook(id) {
    const typeIdObj = await database.connection.query(
      `SELECT booktype from store where book_id = ${id}`
    );
    const typeId = typeIdObj[0].booktype;
    const bookObj = await database.connection.query(
      `SELECT * FROM BOOKTYPE WHERE BOOKTYPE_ID = ${typeId}`
    );
    return bookObj[0];
  }

  async function dataGetterToBook(book, id, date_out) {
    const authorObj = await database.connection.query(
      `SELECT AUTHOR_NAME FROM AUTHOR WHERE ${book.author} = AUTHOR_ID;`
    );
    const ganreObj = await database.connection.query(
      `SELECT GANRE_NAME FROM GANRE WHERE ${book.ganre} = GANRE_ID`
    );

    return {
      ...book,
      book_id: id,
      date_out: date_out,
      authorName: authorObj[0].AUTHOR_NAME,
      ganreName: ganreObj[0].GANRE_NAME,
    };
  }

  const unreturnedBooks = await database.connection.query(
    `SELECT BOOK_ID, READER_ID, DATE_OUT FROM MOVING_B WHERE READER_ID = ${user} AND DATE_IN IS NULL`
  );
  const unreturnedBooksFull = [];
  for (let i = 0; i < unreturnedBooks.length; i++) {
    const element = unreturnedBooks[i];
    const id = element.BOOK_ID;
    const date_out = element.DATE_OUT;
    if (id === undefined) unreturnedBooksFull.push(undefined);
    const book = await getTypeFromBook(id);
    const fullBook = await dataGetterToBook(book, id, date_out);
    unreturnedBooksFull.push(fullBook);
  }
  res.send(unreturnedBooksFull);
});

app.post("/moving_b/", async (req, res) => {
  console.log(req.body);
  try {
    const columns = ["booktype_id", "reader_id", "date_out"];
    const data = {};
    let booktypeId = null;
    let bookId = null;
    Object.entries(req.body).map((element) => {
      if (columns.includes(element[0])) {
        if (element[0].includes("date_out")) {
          element[1] = new Date().toISOString().slice(0, 10);
        }
        if (element[0].includes("booktype_id")) {
          booktypeId = element[1];
        }
        data[element[0]] =
          typeof element[1] === "number"
            ? element[1]
            : JSON.stringify(element[1]);
      }
    });
    bookId = await database.connection.query(
      `SELECT BOOK_ID FROM STORE WHERE BOOKTYPE = ${booktypeId} AND HAVELY = 1 LIMIT 1`
    );
    console.log(bookId);
    data.book_id = bookId[0].BOOK_ID;
    if (data.book_id !== undefined) {
      await database.connection.query(`
    INSERT INTO MOVING_B(book_id, reader_id, date_out) VALUES(${data.book_id}, ${data.reader_id}, ${data.date_out})
      ;`);
      await database.connection.query(
        `UPDATE STORE SET HAVELY = 0 WHERE BOOK_ID = ${data.book_id}`
      );
      res.sendStatus(200);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

app.put("/return", async (req, res) => {
  console.log(req.body);
  const data = req.body;
  const moved = (
    await database.connection.query(
      `SELECT * FROM MOVING_B WHERE BOOK_ID = ${data.book_id} AND READER_ID = ${data.reader_id} AND DATE_IN IS NULL`
    )
  )[0];
  try {
    if (moved !== undefined) {
      await database.connection.query(
        `UPDATE MOVING_B SET DATE_IN = ${JSON.stringify(
          new Date().toISOString().slice(0, 10)
        )} where mov_id = ${moved.mov_id}`
      );

      await database.connection.query(
        `UPDATE STORE SET HAVELY = 1 WHERE BOOK_ID = ${moved.book_id}`
      );
      res.sendStatus(200);
    }
  } catch (error) {
    res.sendStatus(400);
  }
});

app.listen(8000, async () => {
  database.connection = await createConnection({
    host: "localhost",
    port: 3306,
    bigIntAsNumber: true,
    user: "root",
    password: "1234",
    database: "librarypopkov",
    insertIdAsNumber: true,
  });

  console.log("SERVER STARTED");
});
