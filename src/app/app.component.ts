import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  formulario: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.formulario = this.fb.group({
      nomeCompleto: ['', Validators.required],
      dataNascimento: ['', Validators.required], // Alterado para aceitar qualquer valor
      cpf: ['', [Validators.required, this.validarCPF]],
      idade: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      cep: ['', [Validators.required, this.validarCEP]], // Validar o CEP com uma função personalizada
      endereco: this.fb.group({
        rua: [''],
        numero: [''],
        complemento: [''],
        bairro: [''],
        cidade: [''],
        estado: ['']
      })
    });

    // Adiciona um filtro para o evento de entrada do campo CEP
    this.formulario.get('cep')?.valueChanges.subscribe((value) => {
      if (value) {
        const cepSomenteNumeros = value.replace(/\D/g, ''); // Remove caracteres não numéricos
        this.formulario.get('cep')?.setValue(cepSomenteNumeros, { emitEvent: false });
      }
    });
  }

  validarCPF(control: AbstractControl): ValidationErrors | null {
    
    return null;
  }

  validarCEP(control: AbstractControl): ValidationErrors | null {
    const cep = control.value?.replace(/\D/g, '');
    if (cep.length === 8) {
      return null;
    } else {
      return { cepInvalido: true };
    }
  }

  onSubmit() {
    if (this.formulario.valid) {
      console.log(this.formulario.value);
    } else {
      console.log('Formulário inválido');
    }
  }

  buscarEnderecoPorCEP() {
    const cep = this.formulario.get('cep')?.value;
    this.http.get(`https://viacep.com.br/ws/${cep}/json/`).subscribe((data: any) => {
      this.formulario.patchValue({
        endereco: {
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf
        }
      });
    });
  }
}
