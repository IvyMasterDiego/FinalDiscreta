create table `gps_track`
(
	`rider_id` int(11) not null,
    `track_time` datetime not null default current_timestamp,
    `track_lng` decimal(11,7) not null,
	`track_lat` decimal(11,7) not null
)engine = innoDB default charset = latin1;

alter table `gps_track`
	add primary key(`rider_id`),
    add key `track_time`(`track_time`);