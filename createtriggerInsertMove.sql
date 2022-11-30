use librarypopkov;
go
--drop trigger insert_move_book
--go
create trigger insert_move_book
on moving_b
instead of insert
as 
declare @book int = (select book_id from inserted)
declare @havely tinyint;
select @havely = (select havely from store where book_id= @book)
if @havely = 1
begin
declare @reader int = (select reader_id from inserted)
declare @date_out date = getdate()
 insert into moving_b(book_id, reader_id, date_out, date_in)
 values (@book, @reader, @date_out, null);
 update store
 set havely = 0 where book_id = @book
 end
 else
 begin
 print 'haven`t'
 end