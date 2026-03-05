package org.ieee.hrintranet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublicPortalDataDTO {
    private List<JoinerDTO> joiners;
    private List<HolidayDTO> holidays;
    private List<AnnouncementDTO> announcements;
    private List<CarouselSlideDTO> carousel;
    private List<AnnouncementDTO> breakingNews;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class JoinerDTO {
    private Integer id;
    private String type = "joiner";
    private String title;
    private String name;
    private String position;
    private String department;
    private LocalDate startDate;
    private String description;
    private String imageURL;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class HolidayDTO {
    private Integer id;
    private String type = "holiday";
    private String title;
    private LocalDate date;
    private String description;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class AnnouncementDTO {
    private Integer id;
    private String type;
    private String title;
    private String description;
    private LocalDate date;
    private Integer priority;
    private String imageURL;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class CarouselSlideDTO {
    private Integer id;
    private String title;
    private String subtitle;
    private String imageURL;
    private Integer displayOrder;
}
