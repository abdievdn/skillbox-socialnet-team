package socialnet.api.request;

import lombok.Data;

@Data
public class UserRq {
    private String phone;
    private String about;
    private String city;
    private String country;
    private String first_name;
    private String last_name;
    private String birth_date;
    private String photo_id;
    private String messages_permission;
}
