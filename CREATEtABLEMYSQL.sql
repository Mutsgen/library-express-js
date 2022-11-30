create database librarypopkov;
use librarypopkov;

create table author(
author_id int primary key auto_increment,
author_name nvarchar(45) not null,
author_birthday date not null
);

create table ganre(
ganre_id int primary key auto_increment,
ganre_name nvarchar(20)
);

create table booktype (
booktype_id int primary key auto_increment,
title nvarchar(60) not null,
ganre int not null,
author int not null,
foreign key (ganre) references ganre (ganre_id) ON DELETE CASCADE on update cascade,
foreign key (author) references author (author_id) ON DELETE CASCADE on update cascade
);

create table store (
book_id int primary key auto_increment,
booktype int references booktype (booktype_id) ON DELETE CASCADE on update cascade,
havely tinyint not null default(1)
)ENGINE=InnoDB AUTO_INCREMENT=10000;

create table reader(
reader_id int primary key auto_increment,
fio nvarchar(45) not null,
adres nvarchar(50) not null,
passport_seria nvarchar(6) not null,
passport_nomer nvarchar (8) not null,
passport_vydan nvarchar(60) not null,
phone nvarchar(15) not null
);

create table moving_b(
mov_id int primary key auto_increment,
book_id int not null references store(book_id),
reader_id int not null references reader(reader_id),
date_out date not null,
date_in date default(null)
);