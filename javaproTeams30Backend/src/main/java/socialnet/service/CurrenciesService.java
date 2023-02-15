package socialnet.service;

import lombok.RequiredArgsConstructor;
import socialnet.api.response.CurrencyRs;
import socialnet.model.entities.Currency;
import socialnet.model.entities.Person;
import socialnet.repository.CurrenciesRepository;
import org.cloudinary.json.JSONObject;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CurrenciesService {

    private final CurrenciesRepository currenciesRepository;

    @Value("${socialNetwork.currency.data-path}")
    private String path;
    @Value("${socialNetwork.currency.units}")
    private List<String> units;

    @Scheduled(cron = "${socialNetwork.scheduling.currencies}", zone = "${socialNetwork.timezone}")
    public void getCurrencyValues() {
        try (InputStream stream = new URL(path).openStream()) {
            String jsonData = new String(stream.readAllBytes());
            LocalDateTime time = ZonedDateTime.parse(new JSONObject(jsonData).getString("Date")).toLocalDateTime();
            JSONObject currenciesData = new JSONObject(jsonData).getJSONObject("Valute");
            units.forEach(unit -> {
                Currency lastCurrency = currenciesRepository.findFirstByNameOrderByUpdateTimeDesc(unit).orElse(null);
                if (lastCurrency == null || lastCurrency.getUpdateTime().isBefore(time)) {
                    JSONObject unitData = currenciesData.getJSONObject(unit);
                    Currency currency = new Currency();
                    currency.setName(unit);
                    currency.setPrice(String.valueOf(unitData.getDouble("Value")));
                    currency.setUpdateTime(time);
                    currenciesRepository.save(currency);
                }
            });
        }
        catch (IOException ignored) {}
    }

    @Named("getCurrencies")
    public CurrencyRs getCurrencies(Person person) {
        CurrencyRs response = new CurrencyRs();
        currenciesRepository.findFirstByNameOrderByUpdateTimeDesc(units.get(0)).ifPresent(currency -> response.setUsd(currency.getPrice()));
        currenciesRepository.findFirstByNameOrderByUpdateTimeDesc(units.get(1)).ifPresent(currency -> response.setEuro(currency.getPrice()));
        return response;
    }
}
