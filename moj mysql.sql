create database zdravstvo;
use zdravstvo;


create table Karton(
	id  int PRIMARY KEY auto_increment,
	ime varchar(20) NOT NULL,
    prezime varchar(40) NOT NULL,
    dijagnoza varchar(30) NOT NULL,
    doktor varchar(60) NOT NULL,
    izlecen boolean DEFAULT FALSE
    );
    
    create table Doktor(
    id int PRIMARY KEY auto_increment,
    ime varchar(20) NOT NULL,
    prezime varchar(20) NOT NULL
    );
    
    create table NeaktivniPodaci(
	id  int PRIMARY KEY auto_increment,
	ime varchar(20) NOT NULL,
    prezime varchar(40) NOT NULL,
    dijagnoza varchar(30) NOT NULL,
    doktor varchar(60) NOT NULL,
    izlecen boolean DEFAULT FALSE
    );