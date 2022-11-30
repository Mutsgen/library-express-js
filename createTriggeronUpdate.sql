use librarypopkov;
go
--drop trigger updatehavelyWhenReturn
--go
create trigger updatehavelyWhenReturn
on moving_b
instead of update
as
begin
declare @mov_id int;
declare @book_id int;
select @mov_id = (select mov_id from deleted);
select @book_id = (select book_id from deleted);
	update store 
	set havely = 1 where book_id= @book_id;
	update moving_b
	set date_in = getdate() where mov_id = @mov_id;
end