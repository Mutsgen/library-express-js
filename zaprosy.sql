use librarypopkov
go
--select count(book_id) from store, booktype where store.booktype = booktype.booktype_id and havely = 1 and author = 1

---- 1
--select title, ganre_name from booktype,Ganre,Author
--where Ganre.ganre_id = booktype.ganre and Author.author_id = Booktype.author and
--author_name = 'Пушкин А.С.';

-- 2
--select title, ganre_name, (select count(book_id) from store, booktype where store.booktype = booktype.booktype_id and havely = 1 and author = 1) as countBook from booktype,Ganre,Author
--where Ganre.ganre_id = booktype.Ganre and Author.author_id = booktype.author and
--author_name = 'Пушкин А.С.' group by title, ganre_name

-- 4 dont work
--select author_name, title from booktype, store, author, moving_b, reader
--where Author.author_id = booktype.author and moving_b.book_id = store.book_id and store.booktype = booktype.booktype_id and reader.reader_id = moving_b.reader_id and
--fio = 'Панчурин Евгений Понасенкович' and year(date_out) = 2022 and month(date_out) = 10;

-- 5
--select phone, reader.reader_id, fio, count(book_id) as 'readed' from moving_b, reader
--where reader.reader_id = moving_b.reader_id
--group by reader.reader_id, Reader.fio, phone;

-- 6
--select author_name, title, Reader.reader_id, fio from booktype, store, author, moving_b, reader
--where Author.author_id = booktype.author and moving_b.book_id = store.book_id and store.booktype = booktype.booktype_id and reader.reader_id = moving_b.reader_id and
--date_in is null;

-- 7
--select reader.reader_id, fio, adres, passport_seria, passport_nomer, passport_vydan, phone from reader, moving_b
--where reader.reader_id = moving_b.reader_id
--group by fio, reader.reader_id, adres, passport_seria, passport_nomer, passport_vydan, phone
--having count(book_id) = (select max(readed) from (select count(book_id) as readed from moving_b group by reader_id) group_1);

-- 8 wtf
--select top 10 booktype.booktype_id, title, ganre_name, author_name from booktype, store, moving_b, Author, ganre
--where Author.author_id = booktype.author and moving_b.book_id = store.book_id and store.booktype = booktype.booktype_id and booktype.ganre = Ganre.ganre_id
--group by booktype.booktype_id, title, ganre_name, author_name
--order by count(mov_id) desc


-- 9
--select datename(mm, date_out) from moving_b
--where year(date_out) = year(getdate())
--group by datename(mm, date_out)
--having count(mov_id) >= all(select count(mov_id) from moving_b group by date_out);

-- 10
--select title, fio, DATEDIFF(d, date_out, date_in) as 'просрочено(в днях)' from booktype,store, moving_b, reader
--where moving_b.book_id = store.book_id and store.booktype = booktype.booktype_id and reader.reader_id = moving_b.reader_id and ((date_in > dateadd(month, 1, date_out) and date_in is not null) or (getdate() > dateadd(month, 1, date_out) and date_in is null))