import React, { useEffect, useState, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import {LeafletMouseEvent} from 'leaflet';
import api from '../../service/api';

import './styles.css';
import logo from '../../assets/logo.svg';
import axios from 'axios';

interface Item {
  id: number;
  name: string;
  image_url: string;
}

interface IBGEUFResponse{
  sigla:string;
}

interface IBGECityResponse{
  nome:string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);

  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    })
  }, []);

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response =>{
      const ufInitials = response.data.map(uf => uf.sigla);
      setUfs(ufInitials);
    })
  }, []);

  useEffect(() => {
    if(selectedUf === '0'){
      return ;
    }
     
    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response =>{
      const cityNames = response.data.map(uf => uf.nome);
      setCities(cityNames);
    })
  }, [selectedUf]);

  function handlerSelectionUf(event:ChangeEvent<HTMLSelectElement>){
    const uf = event.target.value;
    setSelectedUf(uf);
  }
  
  function handlerSelectionCity(event:ChangeEvent<HTMLSelectElement>){
    const city = event.target.value;
    setSelectedCity(city);
  }

  function handleMapClick(event:LeafletMouseEvent){
    setSelectedPosition([
      event.latlng.lat, 
      event.latlng.lng]
    );
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
                  Voltar para home
              </Link>
      </header>

      <form>
        <h1>Cadastro do<br /> ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className='field-group'>
            <div className='field'>
              <label htmlFor="name">Nome da entidade</label>
              <input
                type="text"
                name="name"
                id="name"
              />
            </div>
            <div className='field'>
              <label htmlFor="name">Whatsapp</label>
              <input
                type="text"
                name="Whatsapp"
                id="Whatsapp"
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereços</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={[-12.249366, -38.9558928]} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select 
                name="uf" 
                id="uf" 
                value={selectedUf} 
                onChange={handlerSelectionUf}
              >                
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select 
                name="city" 
                id="city"
                value={selectedCity}
                onChange={handlerSelectionCity}
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Items de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className='items-grid'>
            {items.map(item => (
              <li key={item.id}>
                <img src={item.image_url} alt={item.name} />
                <span>{item.name}</span>
              </li>
            ))}
            
          </ul>
        </fieldset>

        <button type='submit'>
          Cadastrar ponto de coleta
                </button>
      </form>
    </div>
  );
}

export default CreatePoint;